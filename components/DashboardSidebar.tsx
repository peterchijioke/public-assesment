import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Building2, Upload, Menu, X, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface DashboardSidebarProps {
  userRole: "personal" | "company";
}

const DashboardSidebar = ({ userRole }: DashboardSidebarProps) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;
  const closeMobileMenu = () => setMobileMenuOpen(false);

  const personalLinks = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/dashboard/properties", label: "My Properties", icon: Building2 },
    { href: "/dashboard/upload", label: "Upload Property", icon: Upload },
    { href: "/profile/personal", label: "My Profile", icon: User },
  ];

  const companyLinks = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    {
      href: "/dashboard/properties",
      label: "Company Properties",
      icon: Building2,
    },
    { href: "/dashboard/upload", label: "Upload Property", icon: Upload },
    { href: "/profile/company", label: "Company Profile", icon: User },
  ];

  const links = userRole === "company" ? companyLinks : personalLinks;

  const NavLinks = () => (
    <>
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={closeMobileMenu}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-all hover:bg-muted",
              isActive(link.href) &&
                "bg-primary text-primary-foreground hover:bg-primary-hover"
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="font-medium">{link.label}</span>
          </Link>
        );
      })}
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 bg-card border-r border-border min-h-screen sticky top-0 pt-20">
        <nav className="p-4 space-y-2">
          <NavLinks />
        </nav>
      </aside>

      {/* Mobile Hamburger Button */}
      <div className="lg:hidden fixed bottom-6 right-6 z-40">
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button size="lg" className="rounded-full w-14 h-14 shadow-lg">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] sm:w-[350px] pt-20">
            <nav className="flex flex-col gap-2">
              <NavLinks />
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
};

export default DashboardSidebar;
