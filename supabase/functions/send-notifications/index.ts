import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Helper: base64url decode
function base64UrlDecode(str: string): Uint8Array {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(base64 + padding);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

// Helper: base64url encode
function base64UrlEncode(data: Uint8Array): string {
  let binary = "";
  for (const b of data) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// Create VAPID JWT
async function createVapidJwt(
  audience: string,
  subject: string,
  privateKeyJwk: JsonWebKey
): Promise<string> {
  const key = await crypto.subtle.importKey(
    "jwk",
    privateKeyJwk,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  );

  const header = base64UrlEncode(
    new TextEncoder().encode(JSON.stringify({ typ: "JWT", alg: "ES256" }))
  );

  const now = Math.floor(Date.now() / 1000);
  const payload = base64UrlEncode(
    new TextEncoder().encode(
      JSON.stringify({ aud: audience, exp: now + 86400, sub: subject })
    )
  );

  const signingInput = new TextEncoder().encode(`${header}.${payload}`);
  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    key,
    signingInput
  );

  // Convert DER signature to raw r||s format for JWT
  const sigBytes = new Uint8Array(signature);
  const sigBase64 = base64UrlEncode(sigBytes);

  return `${header}.${payload}.${sigBase64}`;
}

// Encrypt payload for Web Push
async function encryptPayload(
  payload: string,
  p256dhKey: string,
  authSecret: string
): Promise<{ encrypted: Uint8Array; salt: Uint8Array; localPublicKey: Uint8Array }> {
  // Generate local ECDH key pair
  const localKeyPair = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveBits"]
  );

  const localPublicKeyRaw = await crypto.subtle.exportKey("raw", localKeyPair.publicKey);
  const localPublicKey = new Uint8Array(localPublicKeyRaw);

  // Import subscriber's public key
  const subscriberKeyBytes = base64UrlDecode(p256dhKey);
  const subscriberKey = await crypto.subtle.importKey(
    "raw",
    subscriberKeyBytes,
    { name: "ECDH", namedCurve: "P-256" },
    false,
    []
  );

  // Derive shared secret
  const sharedSecret = await crypto.subtle.deriveBits(
    { name: "ECDH", public: subscriberKey },
    localKeyPair.privateKey,
    256
  );

  const authSecretBytes = base64UrlDecode(authSecret);

  // HKDF to derive IKM
  const ikmInfo = new TextEncoder().encode("WebPush: info\0");
  const ikmInfoFull = new Uint8Array(ikmInfo.length + subscriberKeyBytes.length + localPublicKey.length);
  ikmInfoFull.set(ikmInfo);
  ikmInfoFull.set(subscriberKeyBytes, ikmInfo.length);
  ikmInfoFull.set(localPublicKey, ikmInfo.length + subscriberKeyBytes.length);

  const prkKey = await crypto.subtle.importKey("raw", authSecretBytes, { name: "HKDF" }, false, ["deriveBits"]);
  // Actually we need HKDF with the shared secret and auth as salt
  const sharedSecretKey = await crypto.subtle.importKey("raw", new Uint8Array(sharedSecret), "HKDF", false, ["deriveBits"]);

  // PRK = HKDF-Extract(auth_secret, shared_secret)
  const prkMaterial = await crypto.subtle.importKey("raw", new Uint8Array(sharedSecret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const hmacAuth = await crypto.subtle.importKey("raw", authSecretBytes, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  // Actually, HKDF-Extract(salt=auth_secret, ikm=ecdh_secret)
  const prkBytes = new Uint8Array(await crypto.subtle.sign("HMAC", hmacAuth, new Uint8Array(sharedSecret)));

  // IKM = HKDF-Expand(PRK, info, 32)
  const ikm = await hkdfExpand(prkBytes, ikmInfoFull, 32);

  // Generate salt
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // Derive content encryption key and nonce
  const cekInfo = new TextEncoder().encode("Content-Encoding: aes128gcm\0");
  const nonceInfo = new TextEncoder().encode("Content-Encoding: nonce\0");

  // PRK2 = HKDF-Extract(salt, IKM)
  const hmacSalt = await crypto.subtle.importKey("raw", salt, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const prk2 = new Uint8Array(await crypto.subtle.sign("HMAC", hmacSalt, ikm));

  const cek = await hkdfExpand(prk2, cekInfo, 16);
  const nonce = await hkdfExpand(prk2, nonceInfo, 12);

  // Encrypt with AES-128-GCM
  const payloadBytes = new TextEncoder().encode(payload);
  const paddedPayload = new Uint8Array(payloadBytes.length + 1);
  paddedPayload.set(payloadBytes);
  paddedPayload[payloadBytes.length] = 2; // delimiter

  const aesKey = await crypto.subtle.importKey("raw", cek, { name: "AES-GCM" }, false, ["encrypt"]);
  const encryptedData = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: nonce },
    aesKey,
    paddedPayload
  );

  // Build aes128gcm content coding header
  const recordSize = new Uint8Array(4);
  new DataView(recordSize.buffer).setUint32(0, paddedPayload.length + 16 + 1); // +16 for tag, but AES-GCM includes tag
  
  const header = new Uint8Array(salt.length + 4 + 1 + localPublicKey.length);
  header.set(salt, 0);
  new DataView(header.buffer).setUint32(salt.length, new Uint8Array(encryptedData).length + salt.length + 4 + 1 + localPublicKey.length + 1);
  header[salt.length + 4] = localPublicKey.length;
  header.set(localPublicKey, salt.length + 5);

  const encrypted = new Uint8Array(header.length + new Uint8Array(encryptedData).length);
  encrypted.set(header);
  encrypted.set(new Uint8Array(encryptedData), header.length);

  return { encrypted, salt, localPublicKey };
}

async function hkdfExpand(prk: Uint8Array, info: Uint8Array, length: number): Promise<Uint8Array> {
  const hmacKey = await crypto.subtle.importKey("raw", prk, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const input = new Uint8Array(info.length + 1);
  input.set(info);
  input[info.length] = 1;
  const output = new Uint8Array(await crypto.subtle.sign("HMAC", hmacKey, input));
  return output.slice(0, length);
}

// Send push notification to a single subscription
async function sendPushNotification(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: string,
  vapidPublicKey: string,
  vapidPrivateKeyJwk: JsonWebKey
): Promise<boolean> {
  try {
    const endpointUrl = new URL(subscription.endpoint);
    const audience = `${endpointUrl.protocol}//${endpointUrl.host}`;

    const jwt = await createVapidJwt(
      audience,
      "mailto:support@mypilatesplan.app",
      vapidPrivateKeyJwk
    );

    const { encrypted } = await encryptPayload(
      payload,
      subscription.p256dh,
      subscription.auth
    );

    const response = await fetch(subscription.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Encoding": "aes128gcm",
        Authorization: `vapid t=${jwt}, k=${vapidPublicKey}`,
        TTL: "86400",
        Urgency: "normal",
      },
      body: encrypted,
    });

    if (response.status === 410 || response.status === 404) {
      // Subscription expired, should be cleaned up
      return false;
    }

    return response.ok;
  } catch (e) {
    console.error("Push send error:", e);
    return false;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get VAPID keys
    const { data: vapidKeys } = await supabaseAdmin
      .from("app_config")
      .select("key, value")
      .in("key", ["vapid_public_key", "vapid_private_key_jwk"]);

    if (!vapidKeys || vapidKeys.length < 2) {
      return new Response(
        JSON.stringify({ error: "VAPID keys not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const vapidPublicKey = vapidKeys.find((k: any) => k.key === "vapid_public_key")!.value;
    const vapidPrivateKeyJwk = JSON.parse(
      vapidKeys.find((k: any) => k.key === "vapid_private_key_jwk")!.value
    );

    const now = new Date();
    const dayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

    // Get all users with notifications enabled
    const { data: users } = await supabaseAdmin
      .from("user_settings")
      .select("user_id, giorni_allenamento, notifica_orario, notifiche_abilitate, fuso_orario")
      .eq("notifiche_abilitate", true);

    if (!users || users.length === 0) {
      return new Response(
        JSON.stringify({ sent: 0, message: "No users with notifications enabled" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let sentCount = 0;
    let errorCount = 0;

    for (const user of users) {
      const trainingDays = (user as any).giorni_allenamento || [1, 3, 5];
      const notificaOrario = (user as any).notifica_orario || "09:00";
      const userTimezone = (user as any).fuso_orario || "Europe/Rome";

      // Get current time in user's timezone
      const timeFormatter = new Intl.DateTimeFormat("en-GB", {
        timeZone: userTimezone,
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      const timeParts = timeFormatter.formatToParts(now);
      const currentHour = parseInt(timeParts.find(p => p.type === "hour")!.value);
      const currentMinute = parseInt(timeParts.find(p => p.type === "minute")!.value);

      const dowFormatter = new Intl.DateTimeFormat("en-GB", {
        timeZone: userTimezone,
        weekday: "short",
      });
      const currentDow = dayMap[dowFormatter.format(now)] ?? now.getDay();

      const dateFormatter = new Intl.DateTimeFormat("en-CA", {
        timeZone: userTimezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
      const todayKey = dateFormatter.format(now);

      // Check if current user-local time matches preferred notification time (±2 min window, cron runs every 5 min)
      const [targetHour, targetMinute] = notificaOrario.split(":").map(Number);
      const targetTotalMin = targetHour * 60 + targetMinute;
      const currentTotalMin = currentHour * 60 + currentMinute;
      let diffMin = Math.abs(currentTotalMin - targetTotalMin);
      // Handle midnight wraparound
      if (diffMin > 12 * 60) diffMin = 24 * 60 - diffMin;
      if (diffMin > 2) {
        continue; // Not the right time for this user
      }

      // Get push subscriptions for this user
      const { data: subscriptions } = await supabaseAdmin
        .from("push_subscriptions")
        .select("endpoint, p256dh, auth")
        .eq("user_id", user.user_id);

      if (!subscriptions || subscriptions.length === 0) continue;

      // Check if workout already completed today (using Rome timezone date)
      const { data: history } = await supabaseAdmin
        .from("workout_history")
        .select("completato")
        .eq("user_id", user.user_id)
        .eq("data_key", todayKey)
        .eq("completato", true)
        .maybeSingle();

      // Calculate streak for this user
      const { data: allHistory } = await supabaseAdmin
        .from("workout_history")
        .select("data_key, completato")
        .eq("user_id", user.user_id)
        .eq("completato", true)
        .order("data_key", { ascending: false })
        .limit(30);

      let streak = 0;
      if (allHistory && allHistory.length > 0) {
        const dates = new Set(allHistory.map((h: any) => h.data_key));
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        for (let i = 0; i < 60; i++) {
          const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
          const dow = d.getDay();
          if (trainingDays.includes(dow)) {
            if (dates.has(k)) {
              streak++;
            } else if (i > 0) {
              break;
            }
          }
          d.setDate(d.getDate() - 1);
        }
      }

      // Check active challenges
      const { data: challenges } = await supabaseAdmin
        .from("challenge_participations")
        .select("challenge_id, completed_days, completed")
        .eq("user_id", user.user_id)
        .eq("completed", false);

      // Determine notification type and message
      let payloadObj;

      if (history) {
        // Already completed today - skip workout reminder
        // But check if challenge needs completing
        if (challenges && challenges.length > 0) {
          const challenge = challenges[0];
          if (challenge.completed_days > 0) {
            payloadObj = {
              title: "🏆 Challenge in corso!",
              body: `Non dimenticare la tua challenge! Giorno ${challenge.completed_days + 1} ti aspetta`,
              icon: "/pwa-192x192.png",
              url: "/",
            };
          }
        }
        if (!payloadObj) continue; // Nothing to notify
      } else if (streak >= 3 && trainingDays.includes(currentDow)) {
        // Streak at risk - training day but not completed
        payloadObj = {
          title: "🔥 Non perdere la tua streak!",
          body: `Hai una streak di ${streak} giorni! Allenati oggi per mantenerla 💪`,
          icon: "/pwa-192x192.png",
          url: "/",
        };
      } else if (trainingDays.includes(currentDow)) {
        // Normal training day reminder
        payloadObj = {
          title: "🏋️ Allenamento di oggi",
          body: "Hai un allenamento programmato per oggi! Apri l'app per iniziare 💪",
          icon: "/pwa-192x192.png",
          url: "/",
        };
      } else {
        continue;
      }

      for (const sub of subscriptions) {
        const success = await sendPushNotification(
          sub,
          JSON.stringify(payloadObj),
          vapidPublicKey,
          vapidPrivateKeyJwk
        );

        if (success) {
          sentCount++;
        } else {
          errorCount++;
          await supabaseAdmin
            .from("push_subscriptions")
            .delete()
            .eq("endpoint", sub.endpoint);
        }
      }
    }

    return new Response(
      JSON.stringify({ sent: sentCount, errors: errorCount }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Send notifications error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
