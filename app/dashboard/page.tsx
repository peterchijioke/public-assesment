import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Home,
  MapPin,
  Store,
  Plus,
  TrendingUp,
  CheckCircle,
  Clock,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import DashboardSidebar from "@/components/DashboardSidebar";
import { api } from "../lib/api";

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total_properties: 0,
    active_listings: 0,
    verified_properties: 0,
    pending_verification: 0,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    api
      .getDashboardOverview()
      .then((data) => {
        setStats({
          total_properties: data.stats.total_properties,
          active_listings: data.stats.active_listings,
          verified_properties: data.stats.verified_properties,
          pending_verification: data.stats.pending_verification,
        });
      })
      .catch((error) => {
        console.error("Failed to fetch dashboard stats:", error);
      });
  }, []);

  const isCompany = user?.role === "company";

  const propertyTypes = isCompany
    ? [
        {
          name: "Lands",
          icon: MapPin,
          path: "/dashboard/properties/lands",
          color: "text-green-600",
        },
        {
          name: "Houses for Rent",
          icon: Home,
          path: "/dashboard/properties/houses-for-rent",
          color: "text-blue-600",
        },
        {
          name: "Houses for Sale",
          icon: Building2,
          path: "/dashboard/properties/houses-for-sale",
          color: "text-purple-600",
        },
        {
          name: "Shops",
          icon: Store,
          path: "/dashboard/properties/shops",
          color: "text-orange-600",
        },
      ]
    : [
        {
          name: "Houses for Rent",
          icon: Home,
          path: "/dashboard/properties/houses-for-rent",
          color: "text-blue-600",
        },
        {
          name: "Houses for Sale",
          icon: Building2,
          path: "/dashboard/properties/houses-for-sale",
          color: "text-purple-600",
        },
        {
          name: "Flatshares",
          icon: Home,
          path: "/dashboard/properties/flatshares",
          color: "text-pink-600",
        },
        {
          name: "Lands",
          icon: MapPin,
          path: "/dashboard/properties/lands",
          color: "text-green-600",
        },
        {
          name: "Shops",
          icon: Store,
          path: "/dashboard/properties/shops",
          color: "text-orange-600",
        },
      ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="flex w-full">
        <DashboardSidebar
          userRole={(user?.role as "personal" | "company") || "personal"}
        />

        <div className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 pt-24 lg:px-8">
          <div className="mb-8 animate-fade-in">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Welcome back, {user?.email?.split("@")[0]}!
            </h1>
            <p className="text-muted-foreground">
              {isCompany ? "Company Account" : "Personal Account"} Dashboard
            </p>
          </div>

          {/* Stats Grid */}
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in"
            style={{ animationDelay: "0.1s" }}
          >
            <Card className="hover-scale">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Properties
                </CardTitle>
                <Building2 className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {stats.total_properties}
                </div>
              </CardContent>
            </Card>

            <Card className="hover-scale" style={{ animationDelay: "0.2s" }}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Active Listings
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {stats.active_listings}
                </div>
              </CardContent>
            </Card>

            <Card className="hover-scale" style={{ animationDelay: "0.3s" }}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Verified
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {stats.verified_properties}
                </div>
              </CardContent>
            </Card>

            <Card className="hover-scale" style={{ animationDelay: "0.4s" }}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pending
                </CardTitle>
                <Clock className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {stats.pending_verification}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card
            className="mb-8 animate-fade-in"
            style={{ animationDelay: "0.5s" }}
          >
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage your properties</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Link href="/dashboard/upload">
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Upload Property
                  </Button>
                </Link>
                <Link href="/dashboard/properties">
                  <Button variant="outline" className="gap-2">
                    <Building2 className="h-4 w-4" />
                    View All Properties
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Property Types Grid */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6 text-foreground">
              Property Categories
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {propertyTypes.map((type, index) => (
                <Link key={type.path} href={type.path}>
                  <Card
                    className="hover-scale cursor-pointer transition-all hover:border-primary animate-fade-in"
                    style={{ animationDelay: `${0.6 + index * 0.1}s` }}
                  >
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <type.icon className={`h-8 w-8 ${type.color}`} />
                        <CardTitle className="text-lg">{type.name}</CardTitle>
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
