"use client";
import { useEffect, useState } from "react";
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
import { Building2, Search, MapPin, Home } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { ImageViewer } from "@/components/ImageViewer";
import { formatPrice } from "@/lib/utils";
import { useRouter } from "next/navigation";

const Properties = () => {
  const navigate = useRouter();
  const { toast } = useToast();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState<Property["images"]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Get URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryParam = params.get("query");
    const typeParam = params.get("property-type");
    const min = params.get("minPrice");
    const max = params.get("maxPrice");

    if (queryParam) setQuery(queryParam);
    if (typeParam) setPropertyType(typeParam);
    else setPropertyType("all"); // Default to 'all' if no type specified
    if (min) setMinPrice(min);
    if (max) setMaxPrice(max);
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [query, propertyType, minPrice, maxPrice]);

  const fetchProperties = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (query) params.set("query", query);
      if (propertyType && propertyType !== "all")
        params.set("property-type", propertyType);
      if (minPrice) params.set("minPrice", minPrice);
      if (maxPrice) params.set("maxPrice", maxPrice);

      const queryString = params.toString();
      const data = await api.getAllProperties(
        queryString ? `?${queryString}` : ""
      );
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

  const getPropertyPrice = (property: Property) => {
    if ("price" in property) return `₦${formatPrice(property.price)}`;
    if ("rent" in property) return `₦${formatPrice(property.rent)}/month`;
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-16 px-4 w-full">
        <div className="container mx-auto w-full max-w-7xl">
          <div className="mb-8 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Browse Properties
            </h1>
            <p className="text-lg text-muted-foreground">
              Discover properties across Nigeria
            </p>
          </div>

          {/* Filters */}
          <Card
            className="mb-8 animate-fade-in"
            style={{ animationDelay: "0.1s" }}
          >
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by location or name..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={propertyType} onValueChange={setPropertyType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Property Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="house-for-rent">
                      House for Rent
                    </SelectItem>
                    <SelectItem value="house-for-sale">
                      House for Sale
                    </SelectItem>
                    <SelectItem value="flatshare">Flatshare</SelectItem>
                    <SelectItem value="land">Land</SelectItem>
                    <SelectItem value="shop">Shop</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  type="number"
                  placeholder="Min Price (₦)"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />

                <Input
                  type="number"
                  placeholder="Max Price (₦)"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Properties Grid */}
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading properties...</p>
            </div>
          ) : properties.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">
                  No properties found
                </p>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your search filters
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property, index) => (
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
                    <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                      {getPropertyTypeLabel(property.property_type)}
                    </div>
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
                    <div className="mb-4">
                      <div className="text-2xl font-bold text-primary mb-2">
                        {getPropertyPrice(property)}
                      </div>
                      {property.lister_role && (
                        <p className="text-xs text-muted-foreground capitalize">
                          Listed by {property.lister_role}
                        </p>
                      )}
                    </div>
                    <Button
                      className="w-full"
                      onClick={() => navigate.push(`/property/${property.id}`)}
                    >
                      View Details
                    </Button>
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
    </div>
  );
};

export default Properties;
