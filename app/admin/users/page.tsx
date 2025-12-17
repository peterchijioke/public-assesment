"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api, propertyTypeToSlug } from "@/lib/api";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Eye,
  Trash2,
  Building2,
  User,
  MapPin,
  Mail,
  Calendar,
  ToggleLeft,
  ToggleRight,
  Globe,
  Briefcase,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface UserDashboardItem {
  user: {
    id: string;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
  };
  profile_type: "personal" | "company";
  profile: PersonalProfile | CompanyProfile;
}

interface PersonalProfile {
  gender?: string;
  bio?: string;
  state?: string;
  address?: string;
  date_of_birth?: string;
  image_key?: string;
  facebook_url?: string;
  x_url?: string;
  linkedin_url?: string;
  tiktok_url?: string;
  instagram_url?: string;
}

interface CompanyProfile {
  company_name?: string;
  description?: string;
  website?: string;
  state?: string;
  address?: string;
  image_key?: string;
  facebook_url?: string;
  x_url?: string;
  linkedin_url?: string;
  tiktok_url?: string;
  instagram_url?: string;
}

interface Property {
  id: string;
  property_type: string;
  name?: string;
  address: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  state: { id: string; name: string };
  region: { id: string; name: string };
  owner: {
    id: string;
    username: string;
    email: string;
    first_name: string;
    last_name?: string;
  };
}

const AdminUsers = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useRouter();
  const [userType, setUserType] = useState<string>("all");
  const [searchEmail, setSearchEmail] = useState<string>("");
  const [users, setUsers] = useState<UserDashboardItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserDashboardItem | null>(
    null
  );
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [showPropertiesDialog, setShowPropertiesDialog] = useState(false);
  const [userProperties, setUserProperties] = useState<Property[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [totalUsers, setTotalUsers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate.push("/login");
      return;
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const response = await api.getUserDashboard(
          userType,
          searchEmail,
          currentPage
        );
        setUsers(response.results);
        setTotalUsers(response.count);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        toast.error("Failed to load users");
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchUsers();
    }
  }, [isAuthenticated, userType, searchEmail, currentPage]);

  const handleViewProfile = (user: UserDashboardItem) => {
    setSelectedUser(user);
    setShowProfileDialog(true);
  };

  const handleViewProperties = async (user: UserDashboardItem) => {
    setSelectedUser(user);
    setShowPropertiesDialog(true);
    setLoadingProperties(true);

    try {
      const properties = await api.getPropertiesByOwner(user.user.username);
      // API returns array directly, not paginated
      setUserProperties(Array.isArray(properties) ? properties : []);
    } catch (error) {
      console.error("Failed to fetch properties:", error);
      toast.error("Failed to load properties");
    } finally {
      setLoadingProperties(false);
    }
  };

  const handleTogglePropertyActive = async (property: Property) => {
    try {
      await api.togglePropertyActive(property.id, !property.is_active);
      toast.success(
        `Property ${
          property.is_active ? "deactivated" : "activated"
        } successfully`
      );
      // Refresh properties
      if (selectedUser) {
        const refreshedProperties = await api.getPropertiesByOwner(
          selectedUser.user.username
        );
        setUserProperties(
          Array.isArray(refreshedProperties) ? refreshedProperties : []
        );
      }
    } catch (error) {
      console.error("Failed to toggle property active:", error);
      toast.error("Failed to update property status");
    }
  };

  const handleTogglePropertyVerified = async (property: Property) => {
    try {
      await api.togglePropertyVerified(property.id, !property.is_verified);
      toast.success(
        `Property ${
          property.is_verified ? "unverified" : "verified"
        } successfully`
      );
      // Refresh properties
      if (selectedUser) {
        const refreshedProperties = await api.getPropertiesByOwner(
          selectedUser.user.username
        );
        setUserProperties(
          Array.isArray(refreshedProperties) ? refreshedProperties : []
        );
      }
    } catch (error) {
      console.error("Failed to toggle property verified:", error);
      toast.error("Failed to update property verification status");
    }
  };

  const handleDeleteProperty = async (property: Property) => {
    try {
      const slug = propertyTypeToSlug(property.property_type);
      await api.deleteProperty(slug, property.id);
      toast.success("Property deleted successfully");
      // Refresh properties
      if (selectedUser) {
        const refreshedProperties = await api.getPropertiesByOwner(
          selectedUser.user.username
        );
        setUserProperties(
          Array.isArray(refreshedProperties) ? refreshedProperties : []
        );
      }
    } catch (error) {
      console.error("Failed to delete property:", error);
      toast.error("Failed to delete property");
    }
  };

  if (authLoading || isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                User Management
              </h1>
              <p className="text-muted-foreground">
                View and manage user profiles and properties
              </p>
            </div>
            <Button onClick={() => navigate.push("/admin")} variant="outline">
              View Dashboard
            </Button>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    User Type
                  </label>
                  <Select value={userType} onValueChange={setUserType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="personal">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Personal
                        </div>
                      </SelectItem>
                      <SelectItem value="company">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          Company
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Search by Email
                  </label>
                  <Input
                    placeholder="Enter email address..."
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Users List */}
          <Card>
            <CardHeader>
              <CardTitle>Users ({totalUsers})</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No users found
                </div>
              ) : (
                <div className="space-y-4">
                  {users.map((item) => (
                    <Card key={item.user.id} className="overflow-hidden">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-16 w-16">
                            <AvatarImage
                              src={
                                item.profile.image_key
                                  ? `https://pub-3374ba4e11cc4c82ba1742c8f1d3da96.r2.dev/${item.profile.image_key}`
                                  : undefined
                              }
                            />
                            <AvatarFallback>
                              {item.profile_type === "company" ? (
                                <Building2 className="h-8 w-8" />
                              ) : (
                                <User className="h-8 w-8" />
                              )}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-semibold">
                                {item.profile_type === "company"
                                  ? (item.profile as CompanyProfile)
                                      .company_name
                                  : `${item.user.first_name} ${item.user.last_name}`}
                              </h3>
                              <Badge
                                variant={
                                  item.profile_type === "company"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {item.profile_type === "company" ? (
                                  <Building2 className="h-3 w-3 mr-1" />
                                ) : (
                                  <User className="h-3 w-3 mr-1" />
                                )}
                                {item.profile_type}
                              </Badge>
                            </div>

                            <div className="space-y-1 text-sm text-muted-foreground mb-4">
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                {item.user.email}
                              </div>
                              {item.profile.address && (
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4" />
                                  {item.profile.address}
                                </div>
                              )}
                              {item.profile.state && !item.profile.address && (
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4" />
                                  {item.profile.state}
                                </div>
                              )}
                            </div>

                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewProfile(item)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View Profile
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewProperties(item)}
                              >
                                <Building2 className="h-4 w-4 mr-1" />
                                View Properties
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Profile Dialog */}
      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Profile</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage
                    src={
                      selectedUser.profile.image_key
                        ? `https://pub-3374ba4e11cc4c82ba1742c8f1d3da96.r2.dev/${selectedUser.profile.image_key}`
                        : undefined
                    }
                  />
                  <AvatarFallback>
                    {selectedUser.profile_type === "company" ? (
                      <Building2 className="h-10 w-10" />
                    ) : (
                      <User className="h-10 w-10" />
                    )}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">
                    {selectedUser.profile_type === "company"
                      ? (selectedUser.profile as CompanyProfile).company_name
                      : `${selectedUser.user.first_name} ${selectedUser.user.last_name}`}
                  </h3>
                  <p className="text-muted-foreground">
                    @{selectedUser.user.username}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedUser.user.email}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {selectedUser.profile_type === "company" ? (
                  <>
                    {(selectedUser.profile as CompanyProfile).company_name && (
                      <div>
                        <label className="text-sm font-medium flex items-center gap-1">
                          <Building2 className="h-4 w-4" />
                          Company Name
                        </label>
                        <p className="text-muted-foreground">
                          {
                            (selectedUser.profile as CompanyProfile)
                              .company_name
                          }
                        </p>
                      </div>
                    )}
                    {(selectedUser.profile as CompanyProfile).website && (
                      <div>
                        <label className="text-sm font-medium flex items-center gap-1">
                          <Globe className="h-4 w-4" />
                          Website
                        </label>
                        <a
                          href={
                            (selectedUser.profile as CompanyProfile).website
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {(selectedUser.profile as CompanyProfile).website}
                        </a>
                      </div>
                    )}
                    {(selectedUser.profile as CompanyProfile).description && (
                      <div className="col-span-2">
                        <label className="text-sm font-medium">
                          Description
                        </label>
                        <p className="text-muted-foreground">
                          {(selectedUser.profile as CompanyProfile).description}
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {(selectedUser.profile as PersonalProfile).gender && (
                      <div>
                        <label className="text-sm font-medium flex items-center gap-1">
                          <User className="h-4 w-4" />
                          Gender
                        </label>
                        <p className="text-muted-foreground capitalize">
                          {(selectedUser.profile as PersonalProfile).gender}
                        </p>
                      </div>
                    )}
                    {(selectedUser.profile as PersonalProfile)
                      .date_of_birth && (
                      <div>
                        <label className="text-sm font-medium flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Date of Birth
                        </label>
                        <p className="text-muted-foreground">
                          {
                            (selectedUser.profile as PersonalProfile)
                              .date_of_birth
                          }
                        </p>
                      </div>
                    )}
                    {(selectedUser.profile as PersonalProfile).bio && (
                      <div className="col-span-2">
                        <label className="text-sm font-medium">Bio</label>
                        <p className="text-muted-foreground">
                          {(selectedUser.profile as PersonalProfile).bio}
                        </p>
                      </div>
                    )}
                  </>
                )}

                {selectedUser.profile.state && (
                  <div>
                    <label className="text-sm font-medium flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      State
                    </label>
                    <p className="text-muted-foreground">
                      {selectedUser.profile.state}
                    </p>
                  </div>
                )}
                {selectedUser.profile.address && (
                  <div className="col-span-2">
                    <label className="text-sm font-medium flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      Address
                    </label>
                    <p className="text-muted-foreground">
                      {selectedUser.profile.address}
                    </p>
                  </div>
                )}
              </div>

              {/* Social Media Links */}
              {(selectedUser.profile.facebook_url ||
                selectedUser.profile.x_url ||
                selectedUser.profile.linkedin_url ||
                selectedUser.profile.instagram_url ||
                selectedUser.profile.tiktok_url) && (
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Social Media
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {selectedUser.profile.facebook_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={selectedUser.profile.facebook_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Facebook
                        </a>
                      </Button>
                    )}
                    {selectedUser.profile.x_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={selectedUser.profile.x_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          X (Twitter)
                        </a>
                      </Button>
                    )}
                    {selectedUser.profile.linkedin_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={selectedUser.profile.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          LinkedIn
                        </a>
                      </Button>
                    )}
                    {selectedUser.profile.instagram_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={selectedUser.profile.instagram_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Instagram
                        </a>
                      </Button>
                    )}
                    {selectedUser.profile.tiktok_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={selectedUser.profile.tiktok_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          TikTok
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Properties Dialog */}
      <Dialog
        open={showPropertiesDialog}
        onOpenChange={setShowPropertiesDialog}
      >
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Properties</DialogTitle>
          </DialogHeader>
          {loadingProperties ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : userProperties.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No properties found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userProperties.map((property) => (
                  <TableRow key={property.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {property.name || "Unnamed"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {property.address}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{property.property_type}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Badge
                          variant={property.is_active ? "default" : "secondary"}
                        >
                          {property.is_active ? "Active" : "Inactive"}
                        </Badge>
                        {property.is_verified && (
                          <Badge
                            variant="outline"
                            className="bg-green-500/10 text-green-500"
                          >
                            Verified
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2 flex-wrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTogglePropertyActive(property)}
                        >
                          {property.is_active ? (
                            <>
                              <ToggleRight className="h-4 w-4 mr-1" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="h-4 w-4 mr-1" />
                              Activate
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTogglePropertyVerified(property)}
                        >
                          {property.is_verified ? (
                            <>
                              <ToggleRight className="h-4 w-4 mr-1" />
                              Unverify
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="h-4 w-4 mr-1" />
                              Verify
                            </>
                          )}
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete Property
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this property?
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteProperty(property)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminUsers;
