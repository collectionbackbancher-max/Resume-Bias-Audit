import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Plus,
  Plug,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/upload", label: "New Audit", icon: Plus },
    { href: "/integrations", label: "Integrations", icon: Plug },
  ];

  return (
    <div className="min-h-screen bg-black antialiased">
      {/* ── Top Nav ── */}
      <nav className="sticky top-0 z-50 w-full border-b border-cyan-500/20 bg-black/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 font-display font-bold text-xl hover:opacity-80 transition-opacity">
            <div className="bg-cyan-500/20 p-2 rounded-xl">
              <ShieldCheck className="h-5 w-5 text-cyan-400" />
            </div>
            <span className="hidden sm:inline-block text-white">
              BiasAuditor<span className="text-cyan-400">.ai</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          {user && (
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "gap-2 rounded-xl text-gray-400 hover:text-white hover:bg-cyan-500/10",
                      location === item.href && "text-cyan-400 bg-cyan-500/10 font-medium"
                    )}
                    data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              ))}

              <div className="h-5 w-px bg-white/10 mx-3" />

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2.5">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="avatar"
                      className="w-7 h-7 rounded-full object-cover border border-cyan-500/30"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-xs font-bold text-cyan-400">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-400 hidden lg:block" data-testid="text-username">
                    {displayName}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => logout()}
                  className="gap-2 rounded-xl border-white/10 text-gray-400 hover:text-white hover:bg-white/5 hover:border-white/20 bg-transparent"
                  data-testid="button-logout"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Logout
                </Button>
              </div>
            </div>
          )}

          {/* Mobile hamburger */}
          {user && (
            <button
              className="md:hidden p-2 rounded-xl hover:bg-cyan-500/10 text-gray-400 hover:text-white transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          )}

          {!user && (
            <Link href="/login">
              <Button size="sm" className="rounded-full px-5 bg-cyan-500 hover:bg-cyan-600 text-black font-semibold">
                Login / Sign Up
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile dropdown */}
        {isMobileMenuOpen && user && (
          <div className="md:hidden border-b border-cyan-500/20 bg-black/95 backdrop-blur-xl px-6 py-4 flex flex-col gap-1.5">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-2 rounded-xl text-gray-400 hover:text-white hover:bg-cyan-500/10",
                    location === item.href && "text-cyan-400 bg-cyan-500/10"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            ))}
            <div className="h-px w-full bg-white/10 my-1" />
            <div className="px-1 py-0.5 text-xs text-gray-500">{user.email}</div>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10"
              onClick={() => logout()}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        )}
      </nav>

      {/* ── Main content ── */}
      <main className="container mx-auto px-6 py-10">
        {children}
      </main>
    </div>
  );
}
