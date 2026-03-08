import { User } from "lucide-react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  BarChart3,
  CalendarDays,
  Apple,
  BookOpen,
  UserCircle,
  Settings,
  ClipboardList,
  MoreHorizontal,
  Users,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { ProfileData } from "@/hooks/useCloudData";

export type AppView =
  | "dashboard"
  | "equipment"
  | "workout"
  | "progress"
  | "calendar"
  | "food"
  | "library"
  | "programs"
  | "profile"
  | "settings"
  | "more"
  | "community";

interface AppLayoutProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  profile: ProfileData;
  userName: string;
  children: React.ReactNode;
}

const NAV_ITEMS: { view: AppView; label: string; icon: React.ElementType }[] = [
  { view: "dashboard", label: "Home", icon: LayoutDashboard },
  { view: "programs", label: "Allenamenti", icon: ClipboardList },
  { view: "calendar", label: "Calendario", icon: CalendarDays },
  { view: "community", label: "Community", icon: Users },
  { view: "profile", label: "Profilo", icon: UserCircle },
  { view: "progress", label: "Progressi", icon: BarChart3 },
  { view: "food", label: "Alimentazione", icon: Apple },
  { view: "library", label: "Libreria", icon: BookOpen },
  { view: "settings", label: "Impostazioni", icon: Settings },
];

const MOBILE_NAV_ITEMS: { view: AppView; label: string; icon: React.ElementType }[] = [
  { view: "dashboard", label: "Home", icon: LayoutDashboard },
  { view: "programs", label: "Allenamenti", icon: ClipboardList },
  { view: "calendar", label: "Calendario", icon: CalendarDays },
  { view: "community", label: "Community", icon: Users },
  { view: "profile", label: "Profilo", icon: UserCircle },
];

function ProfileAvatar({ profile, size = 36, onClick }: { profile: ProfileData; size?: number; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="rounded-full overflow-hidden border-2 border-primary/20 hover:border-primary/50 transition flex-shrink-0" style={{ width: size, height: size }}>
      {profile.avatar_url ? (
        <img src={profile.avatar_url} alt="Profilo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
      ) : (
        <div className="w-full h-full bg-muted flex items-center justify-center">
          <User size={size * 0.5} className="text-muted-foreground" />
        </div>
      )}
    </button>
  );
}

export function AppLayout({ currentView, onNavigate, profile, userName, children }: AppLayoutProps) {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop/Tablet Sidebar */}
      {!isMobile && (
        <aside className="w-64 bg-card border-r border-border flex flex-col fixed h-full z-40">
          <div className="p-5 border-b border-border">
            <h1 className="text-xl font-black bg-gradient-to-r from-primary to-pilates-deep bg-clip-text text-transparent">
              My Pilates Plan
            </h1>
          </div>

          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {NAV_ITEMS.map(item => {
              const Icon = item.icon;
              const active = currentView === item.view;
              return (
                <button
                  key={item.view}
                  onClick={() => onNavigate(item.view)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all relative ${
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute inset-0 rounded-xl bg-primary/10"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                  <Icon size={20} className="relative z-10" />
                  <span className="relative z-10">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-border">
            <button
              onClick={() => onNavigate("profile")}
              className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-muted transition"
            >
              <ProfileAvatar profile={profile} size={32} />
              <span className="text-sm font-semibold text-foreground truncate">{userName}</span>
            </button>
          </div>
        </aside>
      )}

      {/* Main content area */}
      <div className={`flex-1 flex flex-col ${!isMobile ? "ml-64" : ""}`}>
        {/* Header */}
        <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-lg border-b border-border px-4 py-3">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="min-w-0">
              {isMobile && (
                <h1 className="text-lg font-black bg-gradient-to-r from-primary to-pilates-deep bg-clip-text text-transparent">
                  My Pilates Plan
                </h1>
              )}
              <p className="text-sm text-muted-foreground truncate">
                Welcome, <span className="font-semibold text-foreground">{userName}</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ProfileAvatar
                profile={profile}
                size={36}
                onClick={() => onNavigate("profile")}
              />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className={`flex-1 px-4 py-6 ${isMobile ? "pb-24" : ""}`}>
          <div className="max-w-4xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border z-40 px-2 pb-[env(safe-area-inset-bottom)]">
          <div className="flex items-center justify-around py-2">
            {MOBILE_NAV_ITEMS.map(item => {
              const Icon = item.icon;
              const active = currentView === item.view;
              return (
                <button
                  key={item.view}
                  onClick={() => onNavigate(item.view)}
                  className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all min-w-0 ${
                    active ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <Icon size={20} />
                  <span className="text-[10px] font-semibold truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
