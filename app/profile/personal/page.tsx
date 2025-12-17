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
  PersonalProfile as PersonalProfileType,
  PersonalProfileFormData,
  State,
} from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Upload,
  User,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";

const PersonalProfile = () => {
  const navigate = useRouter();
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<PersonalProfileType | null>(null);
  const [states, setStates] = useState<State[]>([]);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState<PersonalProfileFormData>({
    gender: "",
    bio: "",
    address: "",
    date_of_birth: "",
    picture_key: "",
    facebook_url: "",
    x_url: "",
    linkedin_url: "",
    tiktok_url: "",
    instagram_url: "",
    state: "",
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate.push("/login");
      return;
    }

    if (isAuthenticated) {
      loadProfile();
      loadStates();
    }
  }, [isAuthenticated, isLoading, navigate]);

  const loadProfile = async () => {
    try {
      const data = await api.getPersonalProfile();
      if (data) {
        setProfile(data);
        setFormData({
          gender: data.gender
            ? data.gender.charAt(0).toUpperCase() + data.gender.slice(1)
            : "",
          bio: data.bio || "",
          address: data.address || "",
          date_of_birth: data.date_of_birth || "",
          picture_key: data.picture_key || "",
          facebook_url: data.facebook_url || "",
          x_url: data.x_url || "",
          linkedin_url: data.linkedin_url || "",
          tiktok_url: data.tiktok_url || "",
          instagram_url: data.instagram_url || "",
          state: data.state || "",
        });

        // Set image preview from API response
        if (data.view_image_url) {
          setImagePreview(data.view_image_url);
        }
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const loadStates = async () => {
    try {
      const data = await api.getStates();
      setStates(data);
    } catch (error) {
      console.error("Error loading states:", error);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview("");
    setSelectedFile(null);
    setFormData({ ...formData, picture_key: "" });
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    setImagePreview(previewUrl);
    setSelectedFile(file);
  };

  const handleImageUpload = async () => {
    if (!selectedFile) {
      console.warn("⚠️ [Personal Profile] No file selected for upload");
      return;
    }

    console.log("🟢 [Personal Profile] Starting image upload process");
    console.log("🟢 [Personal Profile] Selected file:", {
      name: selectedFile.name,
      type: selectedFile.type,
      size: selectedFile.size,
    });

    setUploading(true);
    try {
      // Generate presigned URL
      console.log("🟢 [Personal Profile] Requesting presigned URL from API");
      const response = await api.generatePresignedUrl(
        [{ file_name: selectedFile.name, file_type: selectedFile.type }],
        "profile-pictures"
      );
      console.log(
        "🟢 [Personal Profile] Full presigned URL response:",
        JSON.stringify(response, null, 2)
      );

      // API returns array directly, not { files: [...] }
      if (!Array.isArray(response) || response.length === 0) {
        console.error(
          "🔴 [Personal Profile] Invalid response structure:",
          response
        );
        throw new Error("Invalid presigned URL response - expected array");
      }

      const uploadData = response[0];
      console.log("🟢 [Personal Profile] Upload data:", {
        key: uploadData.key,
        upload_url: uploadData.upload_url,
        public_url: uploadData.public_url,
      });

      // Upload to R2
      console.log("🟢 [Personal Profile] Uploading to R2...");
      await api.uploadToR2(uploadData.upload_url, selectedFile);
      console.log("✅ [Personal Profile] R2 upload completed");

      // Save image key to backend
      console.log("🟢 [Personal Profile] Saving image key to backend...");
      const saveResponse = await api.saveProfileImage(uploadData.key);
      console.log("✅ [Personal Profile] Image key saved:", saveResponse);

      // Update form data with uploaded key
      setFormData((prev) => ({ ...prev, picture_key: uploadData.key }));

      // Update preview using the view URL from backend
      setImagePreview(saveResponse.view_image_url);
      setSelectedFile(null);

      toast({
        title: "Image uploaded",
        description: "Your profile picture has been uploaded successfully",
      });
    } catch (error) {
      console.error("🔴 [Personal Profile] Upload failed:", error);
      toast({
        title: "Upload failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Convert gender to lowercase and ensure date format is YYYY-MM-DD
      const submitData = {
        ...formData,
        gender: formData.gender ? formData.gender.toLowerCase() : undefined,
        date_of_birth: formData.date_of_birth || undefined,
      };

      if (profile) {
        await api.updatePersonalProfile(profile.id, submitData);
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully",
        });
      } else {
        await api.createPersonalProfile(submitData);
        toast({
          title: "Profile created",
          description: "Your profile has been created successfully",
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
              <User className="w-6 h-6" />
              Personal Profile
            </CardTitle>
            <CardDescription>
              Manage your personal information and social media links
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Picture */}
              <div className="space-y-3">
                <Label>Profile Picture</Label>
                {imagePreview ? (
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary/20">
                      <img
                        src={imagePreview}
                        alt="Profile preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Input
                        id="picture-change"
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        disabled={uploading}
                        className="hidden"
                      />
                      <Label htmlFor="picture-change">
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
                        onClick={handleRemoveImage}
                        disabled={uploading}
                      >
                        Remove
                      </Button>
                      {selectedFile && (
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleImageUpload}
                          disabled={uploading}
                        >
                          {uploading ? "Uploading..." : "Upload"}
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center border-2 border-dashed border-muted-foreground/25">
                      <User className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <div>
                      <Input
                        id="picture-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        disabled={uploading}
                        className="hidden"
                      />
                      <Label htmlFor="picture-upload">
                        <Button
                          type="button"
                          variant="outline"
                          disabled={uploading}
                          asChild
                        >
                          <span className="cursor-pointer">
                            <Upload className="w-4 h-4 mr-2" />
                            Select Picture
                          </span>
                        </Button>
                      </Label>
                    </div>
                  </div>
                )}
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value: string) =>
                      setFormData({ ...formData, gender: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="date_of_birth"
                    className="flex items-center gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    Date of Birth
                  </Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        date_of_birth: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  placeholder="Tell us about yourself..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Residential Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="Your residential address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State of Origin</Label>
                <Select
                  value={formData.state}
                  onValueChange={(value: string) =>
                    setFormData({ ...formData, state: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a state" />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map((state) => (
                      <SelectItem key={state.id} value={state.id}>
                        {state.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                    placeholder="https://facebook.com/yourprofile"
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
                    placeholder="https://x.com/yourprofile"
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
                    placeholder="https://linkedin.com/in/yourprofile"
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
                    placeholder="https://instagram.com/yourprofile"
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

export default PersonalProfile;
