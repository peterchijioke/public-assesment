"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api, propertyTypeToSlug } from "@/lib/api";
import { Property } from "@/lib/types";
import { PropertyImage } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/ui/phone-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Home,
  Building2,
  MapPin,
  Store,
  ChevronRight,
  ChevronLeft,
  Upload,
  Plus,
  Search,
  Car,
  Waves,
  Dumbbell,
  Shield,
  Zap,
  Home as Balcony,
  Wind,
  Wifi,
  Armchair,
  UtensilsCrossed,
  WashingMachine,
  Tv,
  Flame,
  TreePine,
  Lock,
  Camera,
  Lightbulb,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import DashboardSidebar from "@/components/DashboardSidebar";
import { PropertyType, ListerRole } from "@/lib/types";
import { useRouter, useSearchParams } from "next/navigation";

// room types will be fetched from the server (id + name)

const PropertyUpload = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useRouter();
  const [searchParams] = useSearchParams();
  const editPropertyId = searchParams.find((item) => item === "edit");
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingProperty, setIsLoadingProperty] = useState(false);
  const [existingProperty, setExistingProperty] = useState<Property | null>(
    null
  );
  const [stateSearch, setStateSearch] = useState("");
  const [states, setStates] = useState<any[]>([]);
  const [regions, setRegions] = useState<any[]>([]);
  const [roomTypes, setRoomTypes] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [propertyFeatures, setPropertyFeatures] = useState<any[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [newRegionName, setNewRegionName] = useState("");
  const [showNewRegionDialog, setShowNewRegionDialog] = useState(false);
  const [isCreatingRegion, setIsCreatingRegion] = useState(false);
  const [stateDropdownOpen, setStateDropdownOpen] = useState(false);

  // Image upload state
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [existingImages, setExistingImages] = useState<PropertyImage[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]); // Track image IDs to delete

  // Form state
  const [listerRole, setListerRole] = useState<ListerRole>(null);
  const [propertyType, setPropertyType] = useState<PropertyType | "">("");
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (!isAuthenticated) {
      navigate.push("/login");
    }
  }, [isAuthenticated, navigate]);

  // Load existing property data when in edit mode
  useEffect(() => {
    const loadProperty = async () => {
      if (!editPropertyId) return;

      try {
        setIsLoadingProperty(true);
        const property = await api.getPropertyById(editPropertyId);
        setExistingProperty(property);

        // Pre-fill form data
        setPropertyType(property.property_type);
        setListerRole(property.lister_role);

        // Pre-fill form fields
        const data: any = {
          address: property.address,
          state_id: property.state.id,
          region_id: property.region.id,
          name: property.name || "",
          phone: property.phone || "",
          description: property.description || "",
          bedrooms: property.bedrooms || "",
          bathrooms: property.bathrooms || "",
          size: property.size || "",
        };

        // Add property-type specific fields
        if ("price" in property) data.price = property.price;
        if ("rent" in property) data.rent = property.rent;
        if ("initial_rent" in property)
          data.initial_rent = property.initial_rent;
        if ("rent_breakdown" in property)
          data.rent_breakdown = property.rent_breakdown;
        if ("shared_rent" in property) data.shared_rent = property.shared_rent;
        if ("conditions" in property) data.conditions = property.conditions;
        if ("social_media_handle" in property)
          data.social_media_handle = property.social_media_handle;
        if ("room_type" in property && property.room_type)
          data.room_type_id = property.room_type.id;

        setFormData(data);

        // Pre-select features
        if ("features" in property && property.features) {
          setSelectedFeatures(property.features.map((f: any) => f.id));
        }

        // Load existing images
        if (property.images && property.images.length > 0) {
          setExistingImages(property.images);
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load property for editing",
          variant: "destructive",
        });
        navigate.push("/dashboard/properties");
      } finally {
        setIsLoadingProperty(false);
      }
    };

    loadProperty();
  }, [editPropertyId]);

  // Fetch all states on mount and filter client-side for better UX
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const response = await api.getStates();
        setStates(response);
      } catch (error) {
        console.error("Failed to fetch states:", error);
      }
    };
    fetchStates();
  }, []);

  // Fetch property features on mount
  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const response = await api.getPropertyFeatures();
        setPropertyFeatures(response);
      } catch (error) {
        console.error("Failed to fetch property features:", error);
      }
    };
    fetchFeatures();
  }, []);

  // Fetch room types on mount (use server-side values/ids)
  useEffect(() => {
    const fetchRoomTypes = async () => {
      try {
        const response = await api.getRoomTypes();
        setRoomTypes(response);
      } catch (error) {
        console.error("Failed to fetch room types:", error);
      }
    };
    fetchRoomTypes();
  }, []);

  // Fetch regions when state is selected
  useEffect(() => {
    const fetchRegions = async () => {
      if (formData.state_id) {
        try {
          const response = await api.getRegions(formData.state_id);
          setRegions(response);
        } catch (error) {
          console.error("Failed to fetch regions:", error);
        }
      }
    };

    fetchRegions();
  }, [formData.state_id]);

  const isCompany = user?.role === "company";
  // In edit mode, skip property type selection step entirely
  const totalSteps = editPropertyId
    ? isCompany
      ? 3
      : 3 // Company: role skipped, Personal: has role step
    : isCompany
    ? 4
    : 5; // Company: skip role, Personal: has role + type
  const progress = (step / totalSteps) * 100;

  const propertyTypes = isCompany
    ? [
        { value: "Land", label: "Land", icon: MapPin },
        { value: "HouseForRent", label: "House for Rent", icon: Home },
        { value: "HouseForSale", label: "House for Sale", icon: Building2 },
        { value: "Shop", label: "Shop", icon: Store },
      ]
    : [
        { value: "HouseForRent", label: "House for Rent", icon: Home },
        { value: "HouseForSale", label: "House for Sale", icon: Building2 },
        { value: "Flatshare", label: "Flatshare", icon: Home },
        { value: "Land", label: "Land", icon: MapPin },
        { value: "Shop", label: "Shop", icon: Store },
      ];

  const validateFormStep = () => {
    const currentFormStep = isCompany ? step - 1 : step - 2;

    // Step 1: Role validation (Personal only) - in edit mode allow changing role
    if (step === 1 && !isCompany && !listerRole) {
      toast({
        title: "Required",
        description: "Please select your role",
        variant: "destructive",
      });
      return false;
    }

    // Step 2: Property type validation - SKIP ENTIRELY IN EDIT MODE
    if (
      !editPropertyId &&
      ((step === 1 && isCompany) || (step === 2 && !isCompany))
    ) {
      if (!propertyType) {
        toast({
          title: "Required",
          description: "Please select a property type",
          variant: "destructive",
        });
        return false;
      }
    }

    // Step 3: Form details validation
    // In edit mode for Personal: step 2, for Company: step 1
    // In create mode for Personal: step 3, for Company: step 2
    const isDetailsStep = editPropertyId
      ? (step === 1 && isCompany) || (step === 2 && !isCompany)
      : (step === 2 && isCompany) || (step === 3 && !isCompany);

    if (isDetailsStep) {
      if (!formData.address?.trim()) {
        toast({
          title: "Required",
          description: "Please enter the property address",
          variant: "destructive",
        });
        return false;
      }
      if (!formData.phone) {
        toast({
          title: "Required",
          description: "Please enter a phone number",
          variant: "destructive",
        });
        return false;
      }
      const phoneDigits = formData.phone.replace(/\D/g, "");
      if (phoneDigits.length !== 14 && phoneDigits.length !== 11) {
        // +234 + 11 digits = 14, or just 11 digits
        toast({
          title: "Invalid Phone Number",
          description: "Phone number must be exactly 11 digits",
          variant: "destructive",
        });
        return false;
      }
      if (!formData.state_id) {
        toast({
          title: "Required",
          description: "Please select a state",
          variant: "destructive",
        });
        return false;
      }
      if (!formData.region_id) {
        toast({
          title: "Required",
          description: "Please select a region",
          variant: "destructive",
        });
        return false;
      }

      // Property-specific validation
      if (
        propertyType === "HouseForRent" ||
        propertyType === "HouseForSale" ||
        propertyType === "Flatshare"
      ) {
        if (!formData.room_type_id) {
          toast({
            title: "Required",
            description: "Please select a room type",
            variant: "destructive",
          });
          return false;
        }
      }

      if (propertyType === "HouseForRent" && !formData.rent) {
        toast({
          title: "Required",
          description: "Please enter the monthly rent",
          variant: "destructive",
        });
        return false;
      }

      if (propertyType === "HouseForSale" && !formData.price) {
        toast({
          title: "Required",
          description: "Please enter the property price",
          variant: "destructive",
        });
        return false;
      }

      if (propertyType === "Flatshare" && !formData.shared_rent) {
        toast({
          title: "Required",
          description: "Please enter the shared rent",
          variant: "destructive",
        });
        return false;
      }

      if (propertyType === "Land" && !formData.price) {
        toast({
          title: "Required",
          description: "Please enter the land price",
          variant: "destructive",
        });
        return false;
      }

      if (propertyType === "Shop" && !formData.rent) {
        toast({
          title: "Required",
          description: "Please enter the shop rent",
          variant: "destructive",
        });
        return false;
      }
    }

    // Step 4: Image validation
    // In edit mode for Personal: step 3, for Company: step 2
    // In create mode for Personal: step 4, for Company: step 3
    const isImageStep = editPropertyId
      ? (step === 2 && isCompany) || (step === 3 && !isCompany)
      : (step === 3 && isCompany) || (step === 4 && !isCompany);

    if (isImageStep) {
      const totalImages =
        existingImages.length - imagesToDelete.length + uploadedImages.length;
      if (totalImages === 0) {
        toast({
          title: "Required",
          description: "Please have at least one image",
          variant: "destructive",
        });
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (!validateFormStep()) {
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleCreateRegion = async () => {
    if (!newRegionName.trim() || !formData.state_id) return;

    setIsCreatingRegion(true);
    try {
      const newRegion = await api.createRegion(
        formData.state_id,
        newRegionName.trim()
      );
      setRegions([...regions, newRegion]);
      setFormData({ ...formData, region_id: newRegion.id });
      setNewRegionName("");
      setShowNewRegionDialog(false);
      toast({
        title: "Success!",
        description: "Region created successfully",
      });
    } catch (error) {
      toast({
        title: "Failed to create region",
        description:
          error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsCreatingRegion(false);
    }
  };

  const handleFeatureToggle = (featureId: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(featureId)
        ? prev.filter((id) => id !== featureId)
        : [...prev, featureId]
    );
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    const totalImages =
      existingImages.length -
      imagesToDelete.length +
      uploadedImages.length +
      files.length;
    if (totalImages > 5) {
      toast({
        title: "Too many images",
        description: "Maximum 5 images allowed",
        variant: "destructive",
      });
      return;
    }

    const validFiles = files.filter((file) => {
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not an image`,
          variant: "destructive",
        });
        return false;
      }
      return true;
    });

    setUploadedImages((prev) => [...prev, ...validFiles]);

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviewUrls((prev) => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingImage = (imageId: string) => {
    setImagesToDelete((prev) => [...prev, imageId]);
  };

  const getFeatureIcon = (code: string) => {
    const iconMap: Record<string, any> = {
      parking: Car,
      pool: Waves,
      gym: Dumbbell,
      security: Shield,
      generator: Zap,
      balcony: Balcony,
      ac: Wind,
      wifi: Wifi,
      furnished: Armchair,
      kitchen: UtensilsCrossed,
      laundry: WashingMachine,
      tv: Tv,
      heating: Flame,
      garden: TreePine,
      gate: Lock,
      cctv: Camera,
      electricity: Lightbulb,
    };
    return iconMap[code] || Home;
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.address || !formData.state_id || !formData.region_id) {
      toast({
        title: "Required fields missing",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // In edit mode, images are optional
    if (!editPropertyId && uploadedImages.length === 0) {
      toast({
        title: "Images required",
        description: "Please upload at least one property image",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const normalized: any = {
        ...formData,
      };

      // Handle image uploads if new images are added
      if (uploadedImages.length > 0) {
        const fileRequests = uploadedImages.map((file) => ({
          file_name: file.name,
          file_type: file.type,
        }));

        const presignedResponses = await api.generatePresignedUrl(
          fileRequests,
          "property-images"
        );

        await Promise.all(
          uploadedImages.map((file, index) =>
            api.uploadToR2(presignedResponses[index].upload_url, file)
          )
        );

        normalized.image_keys = presignedResponses.map((r: any) => r.key);
      }

      // Add other required fields
      if (!editPropertyId) normalized.lister_role = listerRole;
      if (formData.state_id) normalized.state_id = formData.state_id;
      if (formData.region_id) normalized.region_id = formData.region_id;
      if (formData.room_type_id)
        normalized.room_type_id = formData.room_type_id;
      if (selectedFeatures.length > 0)
        normalized.feature_ids = selectedFeatures;

      if (editPropertyId) {
        // Delete marked images first
        if (imagesToDelete.length > 0) {
          await Promise.all(
            imagesToDelete.map((imageId) => api.deletePropertyImage(imageId))
          );
        }

        // Update existing property
        const slug = propertyTypeToSlug(propertyType as string);
        await api.updateProperty(slug, editPropertyId, normalized);
        toast({
          title: "Success!",
          description: "Property updated successfully",
        });
      } else {
        // Create new property
        const slug = propertyTypeToSlug(propertyType as string);
        await api.createProperty(slug, normalized);
        toast({
          title: "Success!",
          description: "Property uploaded successfully with images",
        });
      }

      navigate.push("/dashboard/properties");
    } catch (error) {
      toast({
        title: editPropertyId ? "Update failed" : "Upload failed",
        description:
          error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="flex w-full">
        <DashboardSidebar
          userRole={(user?.role as "personal" | "company") || "personal"}
        />

        <div className="flex-1 w-full max-w-4xl mx-auto px-4 py-8 pt-24 lg:px-8">
          <div className="mb-8 animate-fade-in">
            {isLoadingProperty ? (
              <p className="text-muted-foreground">Loading property...</p>
            ) : null}
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {editPropertyId ? "Edit" : "Upload"}{" "}
              {propertyType === "HouseForRent"
                ? "House for Rent"
                : propertyType === "HouseForSale"
                ? "House for Sale"
                : propertyType === "Flatshare"
                ? "Flatshare"
                : propertyType === "Land"
                ? "Land"
                : propertyType === "Shop"
                ? "Shop"
                : "Property"}
            </h1>
            <p className="text-muted-foreground">
              {editPropertyId
                ? "Update your property details"
                : `Step ${step} of ${totalSteps}`}
            </p>
          </div>

          <Progress value={progress} className="mb-8" />

          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle>
                {step === 1 && !isCompany && "Select Your Role"}
                {((step === 1 && isCompany) || (step === 2 && !isCompany)) &&
                  "Select Property Type"}
                {((step === 2 && isCompany) || (step === 3 && !isCompany)) &&
                  "Property Details"}
                {((step === 3 && isCompany) || (step === 4 && !isCompany)) &&
                  "Upload Images"}
                {step === totalSteps && "Review & Submit"}
              </CardTitle>
              <CardDescription>
                {step === 1 &&
                  !isCompany &&
                  !editPropertyId &&
                  "Are you a landlord or realtor?"}
                {!editPropertyId &&
                  ((step === 1 && isCompany) || (step === 2 && !isCompany)) &&
                  "What type of property are you listing?"}
                {(editPropertyId
                  ? (step === 1 && isCompany) || (step === 2 && !isCompany)
                  : (step === 2 && isCompany) || (step === 3 && !isCompany)) &&
                  "Fill in the property information"}
                {(editPropertyId
                  ? (step === 2 && isCompany) || (step === 3 && !isCompany)
                  : (step === 3 && isCompany) || (step === 4 && !isCompany)) &&
                  "Add property photos (minimum 1, maximum 5)"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1: Role Selection (Personal only) - Allow in edit mode */}
              {step === 1 && !isCompany && (
                <div className="grid grid-cols-2 gap-4">
                  <Card
                    className={`cursor-pointer transition-all hover-scale ${
                      listerRole === "landlord"
                        ? "border-primary ring-2 ring-primary"
                        : ""
                    }`}
                    onClick={() => setListerRole("landlord")}
                  >
                    <CardHeader className="text-center">
                      <Building2 className="h-12 w-12 mx-auto mb-2 text-primary" />
                      <CardTitle>Landlord</CardTitle>
                    </CardHeader>
                  </Card>
                  <Card
                    className={`cursor-pointer transition-all hover-scale ${
                      listerRole === "realtor"
                        ? "border-primary ring-2 ring-primary"
                        : ""
                    }`}
                    onClick={() => setListerRole("realtor")}
                  >
                    <CardHeader className="text-center">
                      <Home className="h-12 w-12 mx-auto mb-2 text-primary" />
                      <CardTitle>Realtor</CardTitle>
                    </CardHeader>
                  </Card>
                </div>
              )}

              {/* Step 1 (Company) or Step 2 (Personal): Property Type - Only show if not editing */}
              {!editPropertyId &&
                ((step === 1 && isCompany) || (step === 2 && !isCompany)) && (
                  <div className="grid grid-cols-2 gap-4">
                    {propertyTypes.map((type) => (
                      <Card
                        key={type.value}
                        className={`cursor-pointer transition-all hover-scale ${
                          propertyType === type.value
                            ? "border-primary ring-2 ring-primary"
                            : ""
                        }`}
                        onClick={() =>
                          setPropertyType(type.value as PropertyType)
                        }
                      >
                        <CardHeader className="text-center">
                          <type.icon className="h-10 w-10 mx-auto mb-2 text-primary" />
                          <CardTitle className="text-base">
                            {type.label}
                          </CardTitle>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                )}

              {/* Show property type as read-only when editing */}
              {editPropertyId &&
                ((step === 1 && isCompany) || (step === 2 && !isCompany)) && (
                  <div className="space-y-4">
                    <div className="p-6 bg-muted rounded-lg border-2 border-primary/20">
                      <div className="flex items-center gap-4">
                        {propertyTypes.find((t) => t.value === propertyType)
                          ?.icon && (
                          <div className="p-3 bg-primary/10 rounded-lg">
                            {(() => {
                              const Icon = propertyTypes.find(
                                (t) => t.value === propertyType
                              )!.icon;
                              return <Icon className="h-8 w-8 text-primary" />;
                            })()}
                          </div>
                        )}
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">
                            Property Type
                          </p>
                          <h3 className="text-xl font-semibold">
                            {propertyTypes.find((t) => t.value === propertyType)
                              ?.label || propertyType}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            Property type cannot be changed when editing
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              {/* Property Details Form */}
              {/* In edit mode: step 1 (company) or step 2 (personal) */}
              {/* In create mode: step 2 (company) or step 3 (personal) */}
              {(editPropertyId
                ? (step === 1 && isCompany) || (step === 2 && !isCompany)
                : (step === 2 && isCompany) || (step === 3 && !isCompany)) && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Property Name (Optional)</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Modern 3 Bedroom Apartment"
                      value={formData.name || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address *</Label>
                    <Input
                      id="address"
                      placeholder="Full property address"
                      value={formData.address || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <PhoneInput
                      id="phone"
                      value={formData.phone || ""}
                      onChange={(value) =>
                        setFormData({ ...formData, phone: value })
                      }
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter 11-digit Nigerian phone number
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>State *</Label>
                      <Select
                        value={formData.state_id || ""}
                        onValueChange={(value: any) => {
                          const selectedState = states.find(
                            (s) => s.id === value
                          );
                          setFormData({
                            ...formData,
                            state_id: value,
                            region_id: "",
                          });
                          setRegions([]);
                        }}
                        open={stateDropdownOpen}
                        onOpenChange={setStateDropdownOpen}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Search and select state">
                            {formData.state_id &&
                              states.find((s) => s.id === formData.state_id)
                                ?.name}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          <div className="sticky top-0 bg-background p-2 border-b z-10">
                            <div className="relative">
                              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input
                                placeholder="Search state..."
                                value={stateSearch}
                                onChange={(e) => setStateSearch(e.target.value)}
                                className="pl-8"
                              />
                            </div>
                          </div>
                          {states
                            .filter((state) =>
                              state.name
                                .toLowerCase()
                                .includes(stateSearch.toLowerCase())
                            )
                            .map((state) => (
                              <SelectItem key={state.id} value={state.id}>
                                {state.name}
                              </SelectItem>
                            ))}
                          {states.filter((state) =>
                            state.name
                              .toLowerCase()
                              .includes(stateSearch.toLowerCase())
                          ).length === 0 && (
                            <div className="p-4 text-center text-muted-foreground text-sm">
                              No states found
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Region *</Label>
                      <div className="flex gap-2">
                        <Select
                          value={formData.region_id || ""}
                          onValueChange={(value: any) =>
                            setFormData({ ...formData, region_id: value })
                          }
                          disabled={!formData.state_id}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Select region" />
                          </SelectTrigger>
                          <SelectContent>
                            {regions.map((region) => (
                              <SelectItem key={region.id} value={region.id}>
                                {region.name}
                              </SelectItem>
                            ))}
                            {regions.length === 0 && formData.state_id && (
                              <div className="p-4 text-center text-muted-foreground text-sm">
                                No regions found
                              </div>
                            )}
                          </SelectContent>
                        </Select>
                        <Dialog
                          open={showNewRegionDialog}
                          onOpenChange={setShowNewRegionDialog}
                        >
                          <DialogTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              disabled={!formData.state_id}
                              title="Add new region"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Add New Region</DialogTitle>
                              <DialogDescription>
                                Create a new region for{" "}
                                {
                                  states.find((s) => s.id === formData.state_id)
                                    ?.name
                                }
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label htmlFor="new-region">Region Name</Label>
                                <Input
                                  id="new-region"
                                  placeholder="Enter region name"
                                  value={newRegionName}
                                  onChange={(e) =>
                                    setNewRegionName(e.target.value)
                                  }
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  setShowNewRegionDialog(false);
                                  setNewRegionName("");
                                }}
                              >
                                Cancel
                              </Button>
                              <Button
                                type="button"
                                onClick={handleCreateRegion}
                                disabled={
                                  !newRegionName.trim() || isCreatingRegion
                                }
                              >
                                {isCreatingRegion
                                  ? "Creating..."
                                  : "Create Region"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>

                  {propertyType === "HouseForRent" && (
                    <>
                      <div className="space-y-2">
                        <Label>Room Type *</Label>
                        <Select
                          value={String(formData.room_type_id || "")}
                          onValueChange={(value: any) =>
                            setFormData({ ...formData, room_type_id: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select room type" />
                          </SelectTrigger>
                          <SelectContent>
                            {roomTypes.map((option) => (
                              <SelectItem
                                key={option.id}
                                value={String(option.id)}
                              >
                                {option.name}
                              </SelectItem>
                            ))}
                            {roomTypes.length === 0 && (
                              <div className="p-4 text-center text-muted-foreground text-sm">
                                No room types
                              </div>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Monthly Rent (₦) *</Label>
                        <Input
                          type="number"
                          placeholder="250000"
                          value={formData.rent || ""}
                          onChange={(e) =>
                            setFormData({ ...formData, rent: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Initial Rent (Optional)</Label>
                        <Input
                          type="number"
                          placeholder="e.g., 200000"
                          value={formData.initial_rent || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              initial_rent: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Rent Breakdown (Optional)</Label>
                        <Textarea
                          placeholder="Any breakdown or notes about rent"
                          value={formData.rent_breakdown || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              rent_breakdown: e.target.value,
                            })
                          }
                        />
                      </div>
                      {propertyFeatures.length > 0 && (
                        <div className="space-y-3">
                          <Label>Property Features</Label>
                          <div className="grid grid-cols-2 gap-3">
                            {propertyFeatures.map((feature) => {
                              const FeatureIcon = getFeatureIcon(feature.code);
                              return (
                                <div
                                  key={feature.id}
                                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                                >
                                  <Checkbox
                                    id={`feature-${feature.id}`}
                                    checked={selectedFeatures.includes(
                                      feature.id
                                    )}
                                    onCheckedChange={() =>
                                      handleFeatureToggle(feature.id)
                                    }
                                  />
                                  <FeatureIcon className="h-4 w-4 text-primary" />
                                  <label
                                    htmlFor={`feature-${feature.id}`}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                                  >
                                    {feature.name}
                                  </label>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {propertyType === "HouseForSale" && (
                    <>
                      <div className="space-y-2">
                        <Label>Room Type *</Label>
                        <Select
                          value={String(formData.room_type_id || "")}
                          onValueChange={(value: string) =>
                            setFormData({ ...formData, room_type_id: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select room type" />
                          </SelectTrigger>
                          <SelectContent>
                            {roomTypes.map((option) => (
                              <SelectItem
                                key={option.id}
                                value={String(option.id)}
                              >
                                {option.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Price (₦) *</Label>
                        <Input
                          type="number"
                          placeholder="5000000"
                          value={formData.price || ""}
                          onChange={(e) =>
                            setFormData({ ...formData, price: e.target.value })
                          }
                          required
                        />
                      </div>
                      {propertyFeatures.length > 0 && (
                        <div className="space-y-3">
                          <Label>Property Features</Label>
                          <div className="grid grid-cols-2 gap-3">
                            {propertyFeatures.map((feature) => {
                              const FeatureIcon = getFeatureIcon(feature.code);
                              return (
                                <div
                                  key={feature.id}
                                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                                >
                                  <Checkbox
                                    id={`feature-sale-${feature.id}`}
                                    checked={selectedFeatures.includes(
                                      feature.id
                                    )}
                                    onCheckedChange={() =>
                                      handleFeatureToggle(feature.id)
                                    }
                                  />
                                  <FeatureIcon className="h-4 w-4 text-primary" />
                                  <label
                                    htmlFor={`feature-sale-${feature.id}`}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                                  >
                                    {feature.name}
                                  </label>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {propertyType === "Land" && (
                    <>
                      <div className="space-y-2">
                        <Label>Size (plots) *</Label>
                        <Input
                          type="number"
                          placeholder="2"
                          value={formData.size || ""}
                          onChange={(e) =>
                            setFormData({ ...formData, size: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Price (₦) *</Label>
                        <Input
                          type="number"
                          placeholder="10000000"
                          value={formData.price || ""}
                          onChange={(e) =>
                            setFormData({ ...formData, price: e.target.value })
                          }
                          required
                        />
                      </div>
                    </>
                  )}

                  {propertyType === "Flatshare" && (
                    <>
                      <div className="space-y-2">
                        <Label>Room Type *</Label>
                        <Select
                          value={String(formData.room_type_id || "")}
                          onValueChange={(value: any) =>
                            setFormData({ ...formData, room_type_id: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select room type" />
                          </SelectTrigger>
                          <SelectContent>
                            {roomTypes.map((option) => (
                              <SelectItem
                                key={option.id}
                                value={String(option.id)}
                              >
                                {option.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Monthly Rent (₦) *</Label>
                        <Input
                          type="number"
                          placeholder="150000"
                          value={formData.rent || ""}
                          onChange={(e) =>
                            setFormData({ ...formData, rent: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Shared Rent (Optional)</Label>
                        <Input
                          type="number"
                          placeholder="e.g., 50000"
                          value={formData.shared_rent || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              shared_rent: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Conditions (Optional)</Label>
                        <Textarea
                          placeholder="Describe any sharing conditions"
                          value={formData.conditions || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              conditions: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Social Media Handle (Optional)</Label>
                        <Input
                          placeholder="Instagram or Twitter handle"
                          value={formData.social_media_handle || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              social_media_handle: e.target.value,
                            })
                          }
                        />
                      </div>
                      {propertyFeatures.length > 0 && (
                        <div className="space-y-3">
                          <Label>Property Features</Label>
                          <div className="grid grid-cols-2 gap-3">
                            {propertyFeatures.map((feature) => {
                              const FeatureIcon = getFeatureIcon(feature.code);
                              return (
                                <div
                                  key={feature.id}
                                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                                >
                                  <Checkbox
                                    id={`feature-flatshare-${feature.id}`}
                                    checked={selectedFeatures.includes(
                                      feature.id
                                    )}
                                    onCheckedChange={() =>
                                      handleFeatureToggle(feature.id)
                                    }
                                  />
                                  <FeatureIcon className="h-4 w-4 text-primary" />
                                  <label
                                    htmlFor={`feature-flatshare-${feature.id}`}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                                  >
                                    {feature.name}
                                  </label>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {propertyType === "Shop" && (
                    <>
                      <div className="space-y-2">
                        <Label>Size (sqm) *</Label>
                        <Input
                          type="number"
                          placeholder="50"
                          value={formData.size || ""}
                          onChange={(e) =>
                            setFormData({ ...formData, size: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Monthly Rent (₦) *</Label>
                        <Input
                          type="number"
                          placeholder="150000"
                          value={formData.rent || ""}
                          onChange={(e) =>
                            setFormData({ ...formData, rent: e.target.value })
                          }
                          required
                        />
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Image Upload Step */}
              {/* In edit mode: step 2 (company) or step 3 (personal) */}
              {/* In create mode: step 3 (company) or step 4 (personal) */}
              {(editPropertyId
                ? (step === 2 && isCompany) || (step === 3 && !isCompany)
                : (step === 3 && isCompany) || (step === 4 && !isCompany)) && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <Label htmlFor="image-upload">Property Images *</Label>
                    <p className="text-sm text-muted-foreground">
                      Upload between 1 and 5 high-quality images of your
                      property. The first image will be set as the cover photo.
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {/* Existing images */}
                      {existingImages
                        .filter((img) => !imagesToDelete.includes(img.id))
                        .map((image, index) => (
                          <div
                            key={image.id}
                            className="relative group aspect-square rounded-lg overflow-hidden border-2 border-border"
                          >
                            <img
                              src={image.url || image.presigned_url}
                              alt={`Existing ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            {image.is_cover && (
                              <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                                Cover
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveExistingImage(image.id)
                              }
                              className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>
                          </div>
                        ))}

                      {/* New uploaded images */}
                      {imagePreviewUrls.map((url, index) => (
                        <div
                          key={index}
                          className="relative group aspect-square rounded-lg overflow-hidden border-2 border-border"
                        >
                          <img
                            src={url}
                            alt={`New ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          {existingImages.filter(
                            (img) => !imagesToDelete.includes(img.id)
                          ).length === 0 &&
                            index === 0 && (
                              <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                                Cover
                              </div>
                            )}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        </div>
                      ))}

                      {existingImages.length -
                        imagesToDelete.length +
                        uploadedImages.length <
                        5 && (
                        <label
                          htmlFor="image-upload"
                          className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary cursor-pointer flex flex-col items-center justify-center gap-2 transition-colors bg-muted/30 hover:bg-muted/50"
                        >
                          <Upload className="h-8 w-8 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Add Image
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {existingImages.length -
                              imagesToDelete.length +
                              uploadedImages.length}
                            /5
                          </span>
                        </label>
                      )}
                    </div>

                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </div>

                  {existingImages.length -
                    imagesToDelete.length +
                    uploadedImages.length ===
                    0 && (
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                      <p className="text-sm text-amber-700 dark:text-amber-400">
                        At least one image is required to proceed with the
                        property listing.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Step 4/5: Preview & Submit */}
              {step === totalSteps && (
                <div className="space-y-6">
                  <div className="bg-muted/30 rounded-lg p-6 space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-border">
                      <Building2 className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold">
                        Property Preview
                      </h3>
                    </div>

                    {!isCompany && listerRole && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Listing As
                        </p>
                        <p className="font-medium capitalize">{listerRole}</p>
                      </div>
                    )}

                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Property Type
                      </p>
                      <p className="font-medium">
                        {propertyType === "HouseForRent"
                          ? "House for Rent"
                          : propertyType === "HouseForSale"
                          ? "House for Sale"
                          : propertyType === "Flatshare"
                          ? "Flatshare"
                          : propertyType === "Land"
                          ? "Land"
                          : propertyType === "Shop"
                          ? "Shop"
                          : propertyType}
                      </p>
                    </div>

                    {formData.name && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Property Name
                        </p>
                        <p className="font-medium">{formData.name}</p>
                      </div>
                    )}

                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Address
                      </p>
                      <p className="font-medium">{formData.address}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          State
                        </p>
                        <p className="font-medium">
                          {states.find((s) => s.id === formData.state_id)
                            ?.name || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Region
                        </p>
                        <p className="font-medium">
                          {regions.find((r) => r.id === formData.region_id)
                            ?.name || "N/A"}
                        </p>
                      </div>
                    </div>

                    {(propertyType === "HouseForRent" ||
                      propertyType === "HouseForSale" ||
                      propertyType === "Flatshare") &&
                      formData.room_type_id && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">
                            Room Type
                          </p>
                          <p className="font-medium">
                            {roomTypes.find(
                              (rt) => rt.id === formData.room_type_id
                            )?.name || "N/A"}
                          </p>
                        </div>
                      )}

                    {formData.rent && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Monthly Rent
                        </p>
                        <p className="font-medium text-primary">
                          ₦{Number(formData.rent).toLocaleString()}
                        </p>
                      </div>
                    )}

                    {formData.initial_rent && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Initial Rent
                        </p>
                        <p className="font-medium">
                          ₦{Number(formData.initial_rent).toLocaleString()}
                        </p>
                      </div>
                    )}

                    {formData.rent_breakdown && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Rent Breakdown
                        </p>
                        <p className="font-medium whitespace-pre-wrap">
                          {formData.rent_breakdown}
                        </p>
                      </div>
                    )}

                    {formData.shared_rent && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Shared Rent
                        </p>
                        <p className="font-medium">
                          ₦{Number(formData.shared_rent).toLocaleString()}
                        </p>
                      </div>
                    )}

                    {formData.price && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Price
                        </p>
                        <p className="font-medium text-primary">
                          ₦{Number(formData.price).toLocaleString()}
                        </p>
                      </div>
                    )}

                    {formData.size && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Size
                        </p>
                        <p className="font-medium">
                          {formData.size}{" "}
                          {propertyType === "Land" ? "plots" : "sqm"}
                        </p>
                      </div>
                    )}

                    {formData.conditions && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Conditions
                        </p>
                        <p className="font-medium whitespace-pre-wrap">
                          {formData.conditions}
                        </p>
                      </div>
                    )}

                    {formData.social_media_handle && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Social Media Handle
                        </p>
                        <p className="font-medium">
                          {formData.social_media_handle}
                        </p>
                      </div>
                    )}

                    {selectedFeatures.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Property Features
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {selectedFeatures.map((featureId) => {
                            const feature = propertyFeatures.find(
                              (f) => f.id === featureId
                            );
                            if (!feature) return null;
                            const FeatureIcon = getFeatureIcon(feature.code);
                            return (
                              <div
                                key={featureId}
                                className="flex items-center gap-2 p-2 bg-background rounded-md border border-border"
                              >
                                <FeatureIcon className="h-4 w-4 text-primary" />
                                <span className="text-sm font-medium">
                                  {feature.name}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {uploadedImages.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Property Images
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {imagePreviewUrls.map((url, index) => (
                          <div
                            key={index}
                            className="relative aspect-square rounded-md overflow-hidden border border-border"
                          >
                            <img
                              src={url}
                              alt={`Property ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            {index === 0 && (
                              <div className="absolute top-1 left-1 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded">
                                Cover
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6">
                {/* In edit mode: Company starts at step 1, Personal starts at step 1 */}
                {/* Show back button from step 2+ for both in edit mode */}
                {(editPropertyId ? step > 1 : step > 1) && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    className="gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Back
                  </Button>
                )}

                <div className="ml-auto flex gap-2">
                  {step < totalSteps ? (
                    <Button
                      onClick={handleNext}
                      className="gap-2"
                      disabled={
                        (editPropertyId
                          ? (step === 2 && isCompany) ||
                            (step === 3 && !isCompany)
                          : (step === 3 && isCompany) ||
                            (step === 4 && !isCompany)) &&
                        uploadedImages.length === 0
                      }
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting || isLoadingProperty}
                      className="gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      {isSubmitting
                        ? editPropertyId
                          ? "Updating..."
                          : "Uploading..."
                        : editPropertyId
                        ? "Update Property"
                        : "Submit Property"}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PropertyUpload;
