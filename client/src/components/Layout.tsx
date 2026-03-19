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
  ];

  return (
    <div className="min-h-screen bg-background antialiased">
      {/* ── Top Nav ── */}
      <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 font-display font-bold text-xl hover:opacity-80 transition-opacity">
            <div className="bg-primary/10 p-2 rounded-xl">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <span className="hidden sm:inline-block">
              BiasAuditor<span className="text-primary">.ai</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          {user && (
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={location === item.href ? "secondary" : "ghost"}
                    size="sm"
                    className={cn(
                      "gap-2 rounded-xl",
                      location === item.href && "font-medium"
                    )}
                    data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              ))}

              <div className="h-5 w-px bg-border mx-3" />

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2.5">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="avatar"
                      className="w-7 h-7 rounded-full object-cover border border-border"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold text-primary">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm font-medium text-muted-foreground hidden lg:block" data-testid="text-username">
                    {displayName}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => logout()}
                  className="gap-2 rounded-xl"
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
              className="md:hidden p-2 rounded-xl hover:bg-secondary transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          )}

          {!user && (
            <Link href="/login">
              <Button size="sm" className="rounded-full px-5">Login / Sign Up</Button>
            </Link>
          )}
        </div>

        {/* Mobile dropdown */}
        {isMobileMenuOpen && user && (
          <div className="md:hidden border-b bg-background/95 backdrop-blur-xl px-6 py-4 flex flex-col gap-1.5">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                <Button
                  variant={location === item.href ? "secondary" : "ghost"}
                  className="w-full justify-start gap-2 rounded-xl"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            ))}
            <div className="h-px w-full bg-border my-1" />
            <div className="px-1 py-0.5 text-xs text-muted-foreground">{user.email}</div>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 rounded-xl text-destructive hover:text-destructive"
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
