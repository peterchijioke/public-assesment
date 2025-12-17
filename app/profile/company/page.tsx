"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import {
  CompanyProfile as CompanyProfileType,
  CompanyProfileFormData,
} from "@/lib/types";
import {
  Building2,
  Facebook,
  Globe,
  Instagram,
  Linkedin,
  Twitter,
  Upload,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";

const CompanyProfile = () => {
  const navigate = useRouter();
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<CompanyProfileType | null>(null);
  const [uploading, setUploading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState<CompanyProfileFormData>({
    company_name: "",
    description: "",
    website: "",
    address: "",
    logo_key: "",
    facebook_url: "",
    x_url: "",
    linkedin_url: "",
    tiktok_url: "",
    instagram_url: "",
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate.push("/login");
      return;
    }

    if (isAuthenticated) {
      loadProfile();
    }
  }, [isAuthenticated, isLoading, navigate]);

  const loadProfile = async () => {
    try {
      const data = await api.getCompanyProfile();
      if (data) {
        setProfile(data);
        setFormData({
          company_name: data.company_name || "",
          description: data.description || "",
          website: data.website || "",
          address: data.address || "",
          logo_key: data.logo_key || "",
          facebook_url: data.facebook_url || "",
          x_url: data.x_url || "",
          linkedin_url: data.linkedin_url || "",
          tiktok_url: data.tiktok_url || "",
          instagram_url: data.instagram_url || "",
        });

        // Set logo preview from API response
        if (data.view_image_url) {
          setLogoPreview(data.view_image_url);
        }
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const handleRemoveLogo = () => {
    setLogoPreview("");
    setSelectedFile(null);
    setFormData({ ...formData, logo_key: "" });
  };

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    // Create local preview
    const previewUrl = URL.createObjectURL(file);
    setLogoPreview(previewUrl);
    setSelectedFile(file);
  };

  const handleLogoUpload = async () => {
    if (!selectedFile) {
      console.warn("⚠️ [Company Profile] No file selected for upload");
      return;
    }

    console.log("🟢 [Company Profile] Starting logo upload process");
    console.log("🟢 [Company Profile] Selected file:", {
      name: selectedFile.name,
      type: selectedFile.type,
      size: selectedFile.size,
    });

    setUploading(true);
    try {
      // Generate presigned URL
      console.log("🟢 [Company Profile] Requesting presigned URL from API");
      const response = await api.generatePresignedUrl(
        [{ file_name: selectedFile.name, file_type: selectedFile.type }],
        "company-logos"
      );
      console.log(
        "🟢 [Company Profile] Full presigned URL response:",
        JSON.stringify(response, null, 2)
      );

      // API returns array directly, not { files: [...] }
      if (!Array.isArray(response) || response.length === 0) {
        console.error(
          "🔴 [Company Profile] Invalid response structure:",
          response
        );
        throw new Error("Invalid presigned URL response - expected array");
      }

      const uploadData = response[0];
      console.log("🟢 [Company Profile] Upload data:", {
        key: uploadData.key,
        upload_url: uploadData.upload_url,
        public_url: uploadData.public_url,
      });

      // Upload to R2
      console.log("🟢 [Company Profile] Uploading to R2...");
      await api.uploadToR2(uploadData.upload_url, selectedFile);
      console.log("✅ [Company Profile] R2 upload completed");

      // Save logo key to backend
      console.log("🟢 [Company Profile] Saving logo key to backend...");
      const saveResponse = await api.saveProfileImage(uploadData.key);
      console.log("✅ [Company Profile] Logo key saved:", saveResponse);

      // Update form data with uploaded key
      setFormData((prev) => ({ ...prev, logo_key: uploadData.key }));

      // Update preview using the view URL from backend
      setLogoPreview(saveResponse.view_image_url);
      setSelectedFile(null);

      toast({
        title: "Logo uploaded",
        description: "Your company logo has been uploaded successfully",
      });
    } catch (error) {
      console.error("🔴 [Company Profile] Upload failed:", error);
      toast({
        title: "Upload failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to upload logo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.company_name) {
      toast({
        title: "Validation error",
        description: "Company name is required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      if (profile) {
        await api.updateCompanyProfile(profile.id, formData);
        toast({
          title: "Profile updated",
          description: "Your company profile has been updated successfully",
        });
      } else {
        await api.createCompanyProfile(formData);
        toast({
          title: "Profile created",
          description: "Your company profile has been created successfully",
        });
      }

      loadProfile();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8 pt-24">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-6 h-6" />
              Company Profile
            </CardTitle>
            <CardDescription>
              Manage your company information and social media presence
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Company Logo */}
              <div className="space-y-3">
                <Label>Company Logo</Label>
                {logoPreview ? (
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-primary/20">
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Input
                        id="logo-change"
                        type="file"
                        accept="image/*"
                        onChange={handleLogoSelect}
                        disabled={uploading}
                        className="hidden"
                      />
                      <Label htmlFor="logo-change">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={uploading}
                          asChild
                        >
                          <span className="cursor-pointer">Change</span>
                        </Button>
                      </Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleRemoveLogo}
                        disabled={uploading}
                      >
                        Remove
                      </Button>
                      {selectedFile && (
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleLogoUpload}
                          disabled={uploading}
                        >
                          {uploading ? "Uploading..." : "Upload"}
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 rounded-lg bg-muted flex items-center justify-center border-2 border-dashed border-muted-foreground/25">
                      <Building2 className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <div>
                      <Input
                        id="logo-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleLogoSelect}
                        disabled={uploading}
                        className="hidden"
                      />
                      <Label htmlFor="logo-upload">
                        <Button
                          type="button"
                          variant="outline"
                          disabled={uploading}
                          asChild
                        >
                          <span className="cursor-pointer">
                            <Upload className="w-4 h-4 mr-2" />
                            Select Logo
                          </span>
                        </Button>
                      </Label>
                    </div>
                  </div>
                )}
              </div>

              {/* Company Info */}
              <div className="space-y-2">
                <Label htmlFor="company_name">Company Name *</Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) =>
                    setFormData({ ...formData, company_name: e.target.value })
                  }
                  placeholder="Your company name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Tell us about your company..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website" className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Website
                </Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) =>
                    setFormData({ ...formData, website: e.target.value })
                  }
                  placeholder="https://yourcompany.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Company Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="Company address"
                />
              </div>

              {/* Social Media Links */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Social Media</h3>

                <div className="space-y-2">
                  <Label
                    htmlFor="facebook_url"
                    className="flex items-center gap-2"
                  >
                    <Facebook className="w-4 h-4" />
                    Facebook
                  </Label>
                  <Input
                    id="facebook_url"
                    type="url"
                    value={formData.facebook_url}
                    onChange={(e) =>
                      setFormData({ ...formData, facebook_url: e.target.value })
                    }
                    placeholder="https://facebook.com/yourcompany"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="x_url" className="flex items-center gap-2">
                    <Twitter className="w-4 h-4" />X (Twitter)
                  </Label>
                  <Input
                    id="x_url"
                    type="url"
                    value={formData.x_url}
                    onChange={(e) =>
                      setFormData({ ...formData, x_url: e.target.value })
                    }
                    placeholder="https://x.com/yourcompany"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="linkedin_url"
                    className="flex items-center gap-2"
                  >
                    <Linkedin className="w-4 h-4" />
                    LinkedIn
                  </Label>
                  <Input
                    id="linkedin_url"
                    type="url"
                    value={formData.linkedin_url}
                    onChange={(e) =>
                      setFormData({ ...formData, linkedin_url: e.target.value })
                    }
                    placeholder="https://linkedin.com/company/yourcompany"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="instagram_url"
                    className="flex items-center gap-2"
                  >
                    <Instagram className="w-4 h-4" />
                    Instagram
                  </Label>
                  <Input
                    id="instagram_url"
                    type="url"
                    value={formData.instagram_url}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        instagram_url: e.target.value,
                      })
                    }
                    placeholder="https://instagram.com/yourcompany"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading
                    ? "Saving..."
                    : profile
                    ? "Update Profile"
                    : "Create Profile"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate.push("/dashboard")}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompanyProfile;
