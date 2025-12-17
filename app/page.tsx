import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import PropertyCard from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Users, Building, CheckCircle } from "lucide-react";
import { api } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import heroImage from "@/assets/hero-property-new.jpg";

const Home = () => {
  const navigate = useNavigate();
  const [propertyType, setPropertyType] = useState("");
  const [query, setQuery] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [featuredProperties, setFeaturedProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (propertyType && propertyType !== 'all') params.set('property-type', propertyType);
    if (query) params.set('query', query);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    navigate(`/properties?${params.toString()}`);
  };

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await api.getAllProperties();
        // Get first 4 properties
        const properties = response.slice(0, 4).map((property: any) => {
          const price = property.price 
            ? `₦${formatPrice(property.price)}`
            : property.rent 
            ? `₦${formatPrice(property.rent)}/month`
            : "Contact for price";
          
          // Map property type to user-friendly label
          const propertyTypeLabels: Record<string, string> = {
            'HouseForRent': 'House for Rent',
            'HouseForSale': 'House for Sale',
            'Flatshare': 'Flatshare',
            'Land': 'Land',
            'Shop': 'Shop',
          };
          const propertyType = propertyTypeLabels[property.property_type] || property.property_type;
          
          // Get first image from images array
          const firstImage = property.images?.[0];
          const imageUrl = firstImage?.presigned_url || '/placeholder.svg';
          
          return {
            id: property.id,
            image: imageUrl,
            title: property.name || property.address,
            location: `${property.region?.name || ''}, ${property.state?.name || 'Nigeria'}`,
            price,
            propertyType,
            isVerified: property.is_verified || false,
          };
        });
        setFeaturedProperties(properties);
      } catch (error) {
        console.error("Failed to fetch properties:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProperties();
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 w-full">
        <div className="container mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                Find or List Properties
                <span className="block text-primary">Anywhere in Nigeria</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                The easiest real estate platform for buying, selling and renting properties across Nigeria
              </p>
              
              {/* Search Card */}
              <div className="bg-card rounded-2xl p-6 shadow-lg border border-border">
                <h3 className="text-lg font-semibold mb-4">Search Properties</h3>
                
                <div className="space-y-3">
                  <Input 
                    placeholder="Search location or property name" 
                    className="h-12"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  
                  <Select value={propertyType} onValueChange={setPropertyType}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select Property Type" />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-50">
                      <SelectItem value="all">All Properties</SelectItem>
                      <SelectItem value="house-for-rent">House for Rent</SelectItem>
                      <SelectItem value="house-for-sale">House for Sale</SelectItem>
                      <SelectItem value="flatshare">Flatshare</SelectItem>
                      <SelectItem value="land">Land</SelectItem>
                      <SelectItem value="shop">Shop</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Input 
                      type="number"
                      placeholder="Min Price (₦)" 
                      className="h-12"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                    />
                    <Input 
                      type="number"
                      placeholder="Max Price (₦)" 
                      className="h-12"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                    />
                  </div>
                  
                  <Button 
                    className="w-full h-12 text-base" 
                    size="lg"
                    onClick={handleSearch}
                  >
                    <Search className="mr-2 h-5 w-5" />
                    Search Properties
                  </Button>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-8 pt-4">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    <div className="w-10 h-10 rounded-full bg-primary border-2 border-background" />
                    <div className="w-10 h-10 rounded-full bg-primary/80 border-2 border-background" />
                    <div className="w-10 h-10 rounded-full bg-primary/60 border-2 border-background" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">7M+ Deals Closed</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Building className="w-8 h-8 text-primary" />
                  <div>
                    <p className="text-sm font-semibold">20K+ Verified Properties</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <img 
                src={heroImage} 
                alt="Modern property in Nigeria" 
                className="rounded-2xl shadow-2xl w-full h-[500px] object-cover"
              />
              <div className="absolute bottom-6 left-6 right-6 bg-card/95 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Featured Property</p>
                    <p className="font-semibold text-lg">Modern Family Home</p>
                  </div>
                  <CheckCircle className="w-6 h-6 text-primary" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-16 px-4 bg-accent/30 w-full">
        <div className="container mx-auto w-full">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-sm text-primary font-semibold uppercase tracking-wide mb-2">
                Checkout Our Verified
              </p>
              <h2 className="text-3xl md:text-4xl font-bold">Featured Properties</h2>
              <p className="text-muted-foreground mt-2">
                Explore top-tier listings from trusted property owners across Nigeria
              </p>
            </div>
            <div className="hidden md:flex gap-2">
              <Button variant="outline" size="sm">All</Button>
              <Button variant="ghost" size="sm">Rent</Button>
              <Button variant="ghost" size="sm">Next</Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                Loading properties...
              </div>
            ) : featuredProperties.length > 0 ? (
              featuredProperties.map((property) => (
                <PropertyCard key={property.id} {...property} />
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                No properties available at the moment
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12 px-4 w-full">
        <div className="container mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                  <Building className="w-6 h-6 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">Globassets</span>
              </div>
              <p className="text-sm text-muted-foreground">
                The easiest real estate platform in Nigeria
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/" className="hover:text-primary">Home</a></li>
                <li><a href="/about" className="hover:text-primary">About</a></li>
                <li><a href="/buy" className="hover:text-primary">Buy</a></li>
                <li><a href="/rent" className="hover:text-primary">Rent</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Top Locations</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary">Lagos</a></li>
                <li><a href="#" className="hover:text-primary">Abuja</a></li>
                <li><a href="#" className="hover:text-primary">Port Harcourt</a></li>
                <li><a href="#" className="hover:text-primary">Ibadan</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Subscribe to our Newsletter</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Get the latest property updates
              </p>
              <div className="flex gap-2">
                <Input placeholder="Email" className="flex-1" />
                <Button>Subscribe</Button>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>© 2024 Globassets. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
