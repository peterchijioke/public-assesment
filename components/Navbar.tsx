"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Building2, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const location = usePathname();
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location === path;

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border w-full">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-full w-full">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <Building2 className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">Globassets</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link
            href="/"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive("/") ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Home
          </Link>
          <Link
            href="/about"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive("/about") ? "text-primary" : "text-muted-foreground"
            }`}
          >
            About
          </Link>
          <Link
            href="/properties"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive("/properties") ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Browse Properties
          </Link>
          <Link
            href="/contact"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive("/contact") ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Contact
          </Link>
          {isAuthenticated && (
            <Link
              href="/dashboard"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/dashboard") || location.startsWith("/dashboard")
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              Dashboard
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="hidden md:flex"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="hidden md:flex"
              >
                <Link href="/login">Login</Link>
              </Button>
              <Button size="sm" asChild className="hidden md:flex">
                <Link href="/register">Register</Link>
              </Button>
            </>
          )}

          {/* Mobile Hamburger Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="sm">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-70 sm:w-[350px]">
              <div className="flex flex-col gap-6 mt-8">
                <Link
                  href="/"
                  onClick={closeMobileMenu}
                  className={`text-lg font-medium transition-colors hover:text-primary ${
                    isActive("/") ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  Home
                </Link>
                <Link
                  href="/about"
                  onClick={closeMobileMenu}
                  className={`text-lg font-medium transition-colors hover:text-primary ${
                    isActive("/about")
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  About
                </Link>
                <Link
                  href="/properties"
                  onClick={closeMobileMenu}
                  className={`text-lg font-medium transition-colors hover:text-primary ${
                    isActive("/properties")
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  Browse Properties
                </Link>
                <Link
                  href="/contact"
                  onClick={closeMobileMenu}
                  className={`text-lg font-medium transition-colors hover:text-primary ${
                    isActive("/contact")
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  Contact
                </Link>
                {isAuthenticated && (
                  <Link
                    href="/dashboard"
                    onClick={closeMobileMenu}
                    className={`text-lg font-medium transition-colors hover:text-primary ${
                      isActive("/dashboard") ||
                      location.startsWith("/dashboard")
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    Dashboard
                  </Link>
                )}

                <div className="border-t border-border pt-6 mt-2 flex flex-col gap-3">
                  {isAuthenticated ? (
                    <>
                      <span className="text-sm text-muted-foreground">
                        {user?.email}
                      </span>
                      <Button
                        variant="outline"
                        onClick={handleLogout}
                        className="w-full justify-start"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        asChild
                        className="w-full"
                        onClick={closeMobileMenu}
                      >
                        <Link href="/login">Login</Link>
                      </Button>
                      <Button
                        asChild
                        className="w-full"
                        onClick={closeMobileMenu}
                      >
                        <Link href="/register">Register</Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
