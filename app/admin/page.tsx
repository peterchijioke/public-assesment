"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Home,
  MapPin,
  Store,
  Users,
  CheckCircle,
  Clock,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface AdminStats {
  total_properties: number;
  active_listings: number;
  verified_properties: number;
  pending_verification: number;
  total_personal_users: number;
  total_company_users: number;
  properties_by_type: {
    houses_for_rent: number;
    houses_for_sale: number;
    lands: number;
    flatshares: number;
    shops: number;
  };
}

const AdminDashboard = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate.push("/login");
      return;
    }

    const fetchStats = async () => {
      try {
        const data = await api.getAdminDashboardOverview();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch admin stats:", error);
        toast.error("Failed to load dashboard statistics");
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchStats();
    }
  }, [isAuthenticated, authLoading, navigate]);

  if (authLoading || isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </>
    );
  }

  if (!stats) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <p className="text-muted-foreground">No data available</p>
        </div>
      </>
    );
  }

  const propertyTypeCards = [
    {
      label: "Houses for Rent",
      value: stats.properties_by_type.houses_for_rent,
      icon: Home,
      color: "text-blue-500",
    },
    {
      label: "Houses for Sale",
      value: stats.properties_by_type.houses_for_sale,
      icon: Building2,
      color: "text-green-500",
    },
    {
      label: "Lands",
      value: stats.properties_by_type.lands,
      icon: MapPin,
      color: "text-orange-500",
    },
    {
      label: "Flatshares",
      value: stats.properties_by_type.flatshares,
      icon: Home,
      color: "text-purple-500",
    },
    {
      label: "Shops",
      value: stats.properties_by_type.shops,
      icon: Store,
      color: "text-red-500",
    },
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground">
                Overview of platform statistics
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => navigate.push("/admin/users")}
                variant="outline"
              >
                <Users className="h-4 w-4 mr-2" />
                Manage Users
              </Button>
              <Button
                onClick={() => navigate.push("/admin/properties")}
                variant="outline"
              >
                <Building2 className="h-4 w-4 mr-2" />
                Manage Properties
              </Button>
            </div>
          </div>

          {/* Main Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Properties
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.total_properties}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Listings
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.active_listings}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Verified Properties
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.verified_properties}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pending Verification
                </CardTitle>
                <Clock className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.pending_verification}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* User Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Personal Users
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.total_personal_users}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Company Users
                </CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.total_company_users}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Properties by Type */}
          <Card>
            <CardHeader>
              <CardTitle>Properties by Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {propertyTypeCards.map((item) => (
                  <div
                    key={item.label}
                    className="flex flex-col items-center p-4 bg-muted/50 rounded-lg"
                  >
                    <item.icon className={`h-8 w-8 mb-2 ${item.color}`} />
                    <div className="text-2xl font-bold mb-1">{item.value}</div>
                    <div className="text-sm text-muted-foreground text-center">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
