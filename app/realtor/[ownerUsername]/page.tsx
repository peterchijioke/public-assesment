"use client";
import { useEffect, useState } from "react";
import { Property } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Home, DollarSign, ArrowLeft, User, Mail } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { api } from "@/lib/api";
import { ImageViewer } from "@/components/ImageViewer";
import { Skeleton } from "@/components/ui/skeleton";
import { useParams, useRouter } from "next/navigation";

export default function RealtorPage() {
  const { ownerUsername } = useParams<{ ownerUsername: string }>();
  const navigate = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState<Property["images"]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    const fetchRealtorProperties = async () => {
      if (!ownerUsername) return;

      try {
        setLoading(true);
        const data = await api.getPropertiesByOwner(ownerUsername);
        setProperties(data);
      } catch (error) {
        console.error("Error fetching realtor properties:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRealtorProperties();
  }, [ownerUsername]);

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

  const getPropertyPrice = (property: Property) => {
    if (
      property.property_type === "HouseForRent" ||
      property.property_type === "Flatshare"
    ) {
      return `₦${formatPrice(property.rent)}/month`;
    }
    if (
      property.property_type === "HouseForSale" ||
      property.property_type === "Land"
    ) {
      return `₦${formatPrice(property.price)}`;
    }
    if (property.property_type === "Shop") {
      return `₦${formatPrice(property.rent)}/month`;
    }
    return "Price not available";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate.back()}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">
                {ownerUsername ? `@${ownerUsername}` : "Realtor Profile"}
              </h1>
              <p className="text-muted-foreground">
                {properties.length}{" "}
                {properties.length === 1 ? "Property" : "Properties"} Listed
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </Card>
            ))}
          </div>
        ) : properties.length === 0 ? (
          <Card className="p-12 text-center">
            <Home className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Properties Found</h3>
            <p className="text-muted-foreground">
              This realtor hasn't listed any properties yet.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property, index) => (
              <Card
                key={property.id}
                className="hover-scale animate-fade-in overflow-hidden"
                style={{ animationDelay: `${index * 0.05}s` }}
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
                    <div className="w-full h-full flex items-center justify-center">
                      <Home className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  {property.is_verified && (
                    <Badge className="absolute top-2 right-2 bg-primary">
                      Verified
                    </Badge>
                  )}
                  <Badge className="absolute top-2 left-2 bg-secondary">
                    {getPropertyTypeLabel(property.property_type)}
                  </Badge>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-1">
                    {property.name || property.address}
                  </h3>

                  <div className="flex items-start gap-2 text-sm text-muted-foreground mb-3">
                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">
                      {property.address}, {property.region.name},{" "}
                      {property.state.name}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex items-center gap-1 text-primary font-semibold">
                      <DollarSign className="h-4 w-4" />
                      <span className="text-sm">
                        {getPropertyPrice(property)}
                      </span>
                    </div>

                    {property.lister_role && (
                      <Badge variant="outline" className="text-xs">
                        {property.lister_role}
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <ImageViewer
        images={selectedImages}
        initialIndex={selectedImageIndex}
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
      />
    </div>
  );
}
