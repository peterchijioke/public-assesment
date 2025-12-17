"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Property } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  MapPin,
  Home,
  User,
  Phone,
  Mail,
  Building2,
  CheckCircle2,
  XCircle,
  Bed,
  Bath,
  Maximize,
  Calendar,
  DollarSign,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { ImageViewer } from "@/components/ImageViewer";
import { useParams, useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";

const PropertyDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useRouter();
  const { toast } = useToast();
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [ownerImage, setOwnerImage] = useState<string>("");

  useEffect(() => {
    fetchPropertyDetails();
  }, [id]);

  const fetchPropertyDetails = async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      const data = await api.getPropertyById(id);
      setProperty(data);

      // Fetch owner's profile image
      if (data.owner?.username) {
        fetchOwnerImage(data.owner.username);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load property details",
        variant: "destructive",
      });
      navigate.push("/properties");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOwnerImage = async (username: string) => {
    try {
      const profileData = await api.getPublicProfile(username);
      if (profileData.profile?.view_image_url) {
        setOwnerImage(profileData.profile.view_image_url);
      }
    } catch (error) {
      console.error("Error loading owner image:", error);
    }
  };

  const getPropertyPrice = (property: Property) => {
    if ("price" in property && property.price)
      return `₦${formatPrice(property.price)}`;
    if ("rent" in property && property.rent)
      return `₦${formatPrice(property.rent)}/month`;
    if ("shared_rent" in property && property.shared_rent)
      return `₦${formatPrice(property.shared_rent)}/month`;
    return "N/A";
  };

  const getPropertyTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      HouseForRent: "House for Rent",
      HouseForSale: "House for Sale",
      Flatshare: "Flatshare",
      Land: "Land",
      Shop: "Shop",
    };
    return labels[type] || type;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <p className="text-center text-muted-foreground">
              Loading property details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <Button
            variant="ghost"
            onClick={() => navigate.back()}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Images */}
              <Card>
                <CardContent className="p-0">
                  {property.images && property.images.length > 0 ? (
                    <div
                      className="relative h-96 bg-muted cursor-pointer group overflow-hidden"
                      onClick={() => {
                        setSelectedImageIndex(0);
                        setViewerOpen(true);
                      }}
                    >
                      <img
                        src={property.images[0].presigned_url}
                        alt={property.name || property.address}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                      {property.images.length > 1 && (
                        <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded">
                          +{property.images.length - 1} more photos
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-96 bg-muted flex items-center justify-center">
                      <Home className="h-24 w-24 text-muted-foreground" />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Property Info */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge
                          variant={
                            property.is_verified ? "default" : "secondary"
                          }
                        >
                          {property.is_verified ? (
                            <>
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Verified
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3 mr-1" />
                              Not Verified
                            </>
                          )}
                        </Badge>
                        <Badge variant="outline">
                          {getPropertyTypeLabel(property.property_type)}
                        </Badge>
                      </div>
                      <CardTitle className="text-3xl mb-2">
                        {property.name || property.address}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>
                          {property.address}, {property.state.name},{" "}
                          {property.region.name}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-primary">
                        {getPropertyPrice(property)}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {property.description && (
                    <div>
                      <h3 className="font-semibold mb-2">Description</h3>
                      <p className="text-muted-foreground whitespace-pre-wrap">
                        {property.description}
                      </p>
                    </div>
                  )}

                  <Separator />

                  {/* Property-specific details */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {property.bedrooms && (
                      <div className="flex items-center gap-2">
                        <Bed className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Bedrooms
                          </p>
                          <p className="font-semibold">{property.bedrooms}</p>
                        </div>
                      </div>
                    )}
                    {property.bathrooms && (
                      <div className="flex items-center gap-2">
                        <Bath className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Bathrooms
                          </p>
                          <p className="font-semibold">{property.bathrooms}</p>
                        </div>
                      </div>
                    )}
                    {property.size && (
                      <div className="flex items-center gap-2">
                        <Maximize className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Size</p>
                          <p className="font-semibold">{property.size} sqm</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Property type-specific pricing details */}
                  {property.property_type === "Flatshare" && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="font-semibold mb-3">
                          Rental Information
                        </h3>
                        <div className="space-y-4">
                          {"shared_rent" in property &&
                            property.shared_rent && (
                              <div className="bg-muted/50 p-4 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                  <DollarSign className="h-5 w-5 text-primary" />
                                  <p className="text-sm text-muted-foreground">
                                    Your Share (Monthly)
                                  </p>
                                </div>
                                <p className="text-2xl font-bold text-primary">
                                  ₦{formatPrice(property.shared_rent)}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  This is the portion you would pay per month
                                </p>
                              </div>
                            )}
                          {"rent" in property && property.rent && (
                            <div className="bg-muted/50 p-4 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <Home className="h-5 w-5 text-primary" />
                                <p className="text-sm text-muted-foreground">
                                  Total House Rent (Yearly)
                                </p>
                              </div>
                              <p className="text-xl font-bold">
                                ₦{formatPrice(property.rent)}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Total annual rent for the entire property
                              </p>
                            </div>
                          )}
                          {"conditions" in property && property.conditions && (
                            <div>
                              <p className="text-sm text-muted-foreground mb-2">
                                Conditions
                              </p>
                              <p className="text-sm whitespace-pre-wrap bg-muted/30 p-3 rounded-md">
                                {property.conditions}
                              </p>
                            </div>
                          )}
                          {"social_media_handle" in property &&
                            property.social_media_handle && (
                              <div className="flex items-center gap-2 text-sm">
                                <ExternalLink className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                  Social Media:
                                </span>
                                <span className="font-semibold">
                                  {property.social_media_handle}
                                </span>
                              </div>
                            )}
                        </div>
                      </div>
                    </>
                  )}

                  {property.property_type === "HouseForRent" && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="font-semibold mb-3">
                          Rental Information
                        </h3>
                        <div className="space-y-4">
                          {"initial_rent" in property &&
                            property.initial_rent && (
                              <div className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5 text-primary" />
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    Initial Rent
                                  </p>
                                  <p className="font-semibold">
                                    ₦{formatPrice(property.initial_rent)}
                                  </p>
                                </div>
                              </div>
                            )}
                          {"rent_breakdown" in property &&
                            property.rent_breakdown && (
                              <div>
                                <p className="text-sm text-muted-foreground mb-2">
                                  Rent Breakdown
                                </p>
                                <p className="text-sm whitespace-pre-wrap bg-muted/30 p-3 rounded-md">
                                  {property.rent_breakdown}
                                </p>
                              </div>
                            )}
                        </div>
                      </div>
                    </>
                  )}

                  {(property.property_type === "HouseForSale" ||
                    property.property_type === "Land") &&
                    "price" in property &&
                    property.price && (
                      <>
                        <Separator />
                        <div>
                          <h3 className="font-semibold mb-3">
                            Pricing Information
                          </h3>
                          <div className="bg-muted/50 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <DollarSign className="h-5 w-5 text-primary" />
                              <p className="text-sm text-muted-foreground">
                                Sale Price
                              </p>
                            </div>
                            <p className="text-2xl font-bold text-primary">
                              ₦{formatPrice(property.price)}
                            </p>
                          </div>
                        </div>
                      </>
                    )}

                  {property.property_type === "Shop" &&
                    "rent" in property &&
                    property.rent && (
                      <>
                        <Separator />
                        <div>
                          <h3 className="font-semibold mb-3">
                            Rental Information
                          </h3>
                          <div className="bg-muted/50 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <DollarSign className="h-5 w-5 text-primary" />
                              <p className="text-sm text-muted-foreground">
                                Monthly Rent
                              </p>
                            </div>
                            <p className="text-2xl font-bold text-primary">
                              ₦{formatPrice(property.rent)}
                            </p>
                          </div>
                        </div>
                      </>
                    )}

                  {/* Features */}
                  {"features" in property &&
                    property.features &&
                    property.features.length > 0 && (
                      <>
                        <Separator />
                        <div>
                          <h3 className="font-semibold mb-3">
                            Features & Amenities
                          </h3>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {property.features.map((feature) => (
                              <div
                                key={feature.id}
                                className="flex items-center gap-2"
                              >
                                <CheckCircle2 className="h-4 w-4 text-primary" />
                                <span className="text-sm">{feature.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Lister Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Listed By</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Link
                    href={`/user/${property.owner.username}`}
                    className="block"
                  >
                    <div className="flex items-center gap-3 hover:bg-accent/50 p-2 rounded-lg transition-colors cursor-pointer">
                      <div className="h-12 w-12 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                        {ownerImage ? (
                          <img
                            src={ownerImage}
                            alt={property.owner.username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="h-6 w-6 text-primary" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">
                          {property.owner.username}
                        </p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {property.lister_role || "Property Owner"}
                        </p>
                      </div>
                    </div>
                  </Link>

                  {property.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={`tel:${property.phone}`}
                        className="hover:text-primary"
                      >
                        {property.phone}
                      </a>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {property.owner.email}
                    </span>
                  </div>

                  <Separator />

                  <Link href={`/realtor/${property.owner.username}`}>
                    <Button variant="outline" className="w-full">
                      <Building2 className="h-4 w-4 mr-2" />
                      View All Listings
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Contact CTA */}
              <Card>
                <CardContent className="pt-6">
                  <Button className="w-full mb-3" size="lg">
                    <Phone className="h-4 w-4 mr-2" />
                    Contact Seller
                  </Button>
                  <Button variant="outline" className="w-full" size="lg">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Share Property
                  </Button>
                </CardContent>
              </Card>

              {/* Property Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Property Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Property ID</span>
                    <span className="font-mono">{property.id.slice(0, 8)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Posted</span>
                    <span>
                      {new Date(property.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {property.updated_at && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Updated</span>
                      <span>
                        {new Date(property.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <ImageViewer
        images={property.images || []}
        initialIndex={selectedImageIndex}
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
      />
    </div>
  );
};

export default PropertyDetails;
