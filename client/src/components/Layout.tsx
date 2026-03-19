import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  BarChart2, 
  LogOut, 
  Menu, 
  X, 
  ShieldCheck,
  Plus
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Dashboard", icon: BarChart2 },
    { href: "/upload", label: "New Audit", icon: Plus },
  ];

  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 font-display font-bold text-xl hover:opacity-80 transition-opacity">
            <div className="bg-primary/10 p-2 rounded-lg">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <span className="hidden sm:inline-block">BiasAuditor<span className="text-primary">.ai</span></span>
          </Link>

          {/* Desktop Nav */}
          {user && (
            <div className="hidden md:flex items-center gap-6">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button 
                    variant={location === item.href ? "secondary" : "ghost"}
                    className={cn(
                      "gap-2",
                      location === item.href && "bg-secondary font-medium"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              ))}
              <div className="h-6 w-px bg-border mx-2" />
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-muted-foreground">
                  {user.firstName || user.email}
                </span>
                <Button variant="outline" size="sm" onClick={() => logout()} className="gap-2">
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          )}

          {/* Mobile Menu Button */}
          {user && (
            <button 
              className="md:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          )}
          
          {!user && (
            <div className="flex gap-4">
              <Link href="/api/login">
                <Button>Login / Sign Up</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && user && (
          <div className="md:hidden border-b bg-background p-4 flex flex-col gap-2 animate-in slide-in-from-top-2">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                <Button 
                  variant={location === item.href ? "secondary" : "ghost"}
                  className="w-full justify-start gap-2"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            ))}
            <div className="h-px w-full bg-border my-2" />
            <Button variant="ghost" className="w-full justify-start gap-2 text-destructive hover:text-destructive" onClick={() => logout()}>
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 animate-in fade-in duration-500">
        {children}
      </main>
    </div>
  );
}
