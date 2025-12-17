import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PropertyCardProps {
  id: string;
  image: string;
  title: string;
  location: string;
  price: string;
  propertyType: string;
  isVerified: boolean;
}

const PropertyCard = ({ id, image, title, location, price, propertyType, isVerified }: PropertyCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/property/${id}`);
  };

  return (
    <Card 
      className="overflow-hidden group cursor-pointer hover:shadow-lg transition-all duration-300 hover-scale" 
      onClick={handleClick}
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm">
            {propertyType}
          </Badge>
          {isVerified && (
            <Badge className="bg-primary/90 backdrop-blur-sm">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Verified
            </Badge>
          )}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-1">{title}</h3>
        <div className="flex items-center gap-1 text-muted-foreground text-sm mb-3">
          <MapPin className="w-4 h-4" />
          <span>{location}</span>
        </div>
        <p className="text-xl font-bold text-primary">{price}</p>
      </div>
    </Card>
  );
};

export default PropertyCard;
