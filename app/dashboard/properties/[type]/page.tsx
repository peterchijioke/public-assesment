"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { Property } from "@/lib/types";
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
  Building2,
  Search,
  MapPin,
  Eye,
  Edit,
  Trash2,
  Home,
  CheckCircle2,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import DashboardSidebar from "@/components/DashboardSidebar";
import { ImageViewer } from "@/components/ImageViewer";
import { formatPrice } from "@/lib/utils";
import { useParams, useRouter } from "next/navigation";

const DashboardProperties = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useRouter();
  const { type: propertyType } = useParams<{ type?: string }>();
  const { toast } = useToast();
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState<Property["images"]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(
    null
  );

  useEffect(() => {
    if (!isAuthenticated) {
      navigate.push("/login");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    fetchProperties();
  }, [propertyType]);

  useEffect(() => {
    filterProperties();
  }, [searchQuery, filterType, properties]);

  const fetchProperties = async () => {
    try {
      setIsLoading(true);
      // Fetch user's own properties
      const data = await api.getMyProperties(propertyType);
      setProperties(Array.isArray(data) ? data : []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load properties",
        variant: "destructive",
      });
      setProperties([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterProperties = () => {
    let filtered = properties;

    if (filterType !== "all") {
      filtered = filtered.filter((p) => p.property_type === filterType);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.state.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProperties(filtered);
  };

  const getPropertyPrice = (property: Property) => {
    if ("price" in property) return `₦${formatPrice(property.price)}`;
    if ("rent" in property) return `₦${formatPrice(property.rent)}/month`;
    return "N/A";
  };

  const confirmDelete = (property: Property) => {
    setPropertyToDelete(property);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!propertyToDelete) return;

    try {
      // Map property_type to the correct API endpoint format
      const typeMap: Record<string, string> = {
        HouseForRent: "houses-for-rent",
        HouseForSale: "houses-for-sale",
        Flatshare: "flatshares",
        Land: "lands",
        Shop: "shops",
      };

      const propertyTypeSlug = typeMap[propertyToDelete.property_type];

      if (!propertyTypeSlug) {
        throw new Error(
          `Unknown property type: ${propertyToDelete.property_type}`
        );
      }

      // Call the delete API
      await api.deleteProperty(propertyTypeSlug, propertyToDelete.id);

      // Close dialog first
      setDeleteDialogOpen(false);
      setPropertyToDelete(null);

      // Refresh the properties list after successful deletion
      await fetchProperties();

      toast({
        title: "Success",
        description: "Property deleted successfully",
      });
      fetchProperties();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete property",
        variant: "destructive",
      });
    }
  };

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
              My Properties
            </h1>
            <p className="text-muted-foreground">
              Manage all your property listings
            </p>
          </div>

          {/* Filters */}
          <Card
            className="mb-8 animate-fade-in"
            style={{ animationDelay: "0.1s" }}
          >
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search properties..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Property Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="HouseForRent">
                      Houses for Rent
                    </SelectItem>
                    <SelectItem value="HouseForSale">
                      Houses for Sale
                    </SelectItem>
                    <SelectItem value="Flatshare">Flatshares</SelectItem>
                    <SelectItem value="Land">Lands</SelectItem>
                    <SelectItem value="Shop">Shops</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Properties Grid */}
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading properties...</p>
            </div>
          ) : filteredProperties.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">
                  No properties found
                </p>
                <Button onClick={() => navigate.push("/dashboard/upload")}>
                  Upload Your First Property
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map((property, index) => (
                <Card
                  key={property.id}
                  className="hover-scale animate-fade-in"
                  style={{ animationDelay: `${0.2 + index * 0.05}s` }}
                >
                  <div
                    className="relative h-48 bg-muted overflow-hidden cursor-pointer group"
                    onClick={() => {
                      if (property.images && property.images.length > 0) {
                        setSelectedImages(property.images);
                        setSelectedImageIndex(0);
                        setViewerOpen(true);
                      }
                    }}
                  >
                    {property.images &&
                    property.images.length > 0 &&
                    property.images[0].presigned_url ? (
                      <>
                        <img
                          src={property.images[0].presigned_url}
                          alt={property.name || property.address}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                          <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 px-3 py-1 rounded">
                            View Images ({property.images.length})
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Home className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    {property.is_verified && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                        Verified
                      </div>
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg line-clamp-1">
                      {property.name || property.address}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span className="line-clamp-1">
                        {property.state.name}, {property.region.name}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-bold text-primary">
                        {getPropertyPrice(property)}
                      </span>
                      {property.is_verified && (
                        <Badge variant="default" className="text-xs">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 gap-2"
                        onClick={() =>
                          navigate.push(`/property/${property.id}`)
                        }
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 gap-2"
                        onClick={() =>
                          navigate.push(`/dashboard/upload?edit=${property.id}`)
                        }
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2 text-destructive hover:text-destructive"
                        onClick={() => confirmDelete(property)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <ImageViewer
        images={selectedImages}
        initialIndex={selectedImageIndex}
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Property</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "
              {propertyToDelete?.name || propertyToDelete?.address}"? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DashboardProperties;
