import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Convert ArrayBuffer to base64url string
function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function generateVapidKeys() {
  const keyPair = await crypto.subtle.generateKey(
    { name: "ECDSA", namedCurve: "P-256" },
    true,
    ["sign", "verify"]
  );

  const publicKeyJwk = await crypto.subtle.exportKey("jwk", keyPair.publicKey);
  const privateKeyJwk = await crypto.subtle.exportKey("jwk", keyPair.privateKey);

  // Convert JWK public key to uncompressed point format (65 bytes: 0x04 + x + y)
  const x = Uint8Array.from(atob(publicKeyJwk.x!.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));
  const y = Uint8Array.from(atob(publicKeyJwk.y!.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));
  const publicKeyRaw = new Uint8Array(65);
  publicKeyRaw[0] = 0x04;
  publicKeyRaw.set(x, 1);
  publicKeyRaw.set(y, 33);

  const publicKeyBase64Url = arrayBufferToBase64Url(publicKeyRaw.buffer);

  return {
    publicKey: publicKeyBase64Url,
    privateKeyJwk: JSON.stringify(privateKeyJwk),
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Require authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const sbAuth = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!);
    const { data: claims, error: authErr } = await sbAuth.auth.getClaims(authHeader.replace("Bearer ", ""));
    if (authErr || !claims?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check if keys already exist
    const { data: existing } = await supabaseAdmin
      .from("app_config")
      .select("value")
      .eq("key", "vapid_public_key")
      .maybeSingle();

    if (existing) {
      return new Response(
        JSON.stringify({ publicKey: existing.value }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Only admins can generate new keys
    const userId = claims.claims.sub;
    const { data: isAdmin } = await supabaseAdmin.rpc("has_role", { _user_id: userId, _role: "admin" });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Check if keys already exist
    const { data: existing } = await supabaseAdmin
      .from("app_config")
      .select("value")
      .eq("key", "vapid_public_key")
      .maybeSingle();

    if (existing) {
      return new Response(
        JSON.stringify({ publicKey: existing.value }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate new VAPID keys
    const keys = await generateVapidKeys();

    // Store both keys
    await supabaseAdmin.from("app_config").upsert([
      { key: "vapid_public_key", value: keys.publicKey },
      { key: "vapid_private_key_jwk", value: keys.privateKeyJwk },
    ]);

    return new Response(
      JSON.stringify({ publicKey: keys.publicKey }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
