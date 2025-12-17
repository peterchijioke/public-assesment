"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Building2,
  MapPin,
  Globe,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Calendar,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { useParams } from "next/navigation";
import Link from "next/link";

interface ProfileData {
  user: {
    username: string;
    id: string;
  };
  profile: any;
  profile_type: "personal" | "company";
}

const ProfileView = () => {
  const { username } = useParams<{ username: string }>();
  const { toast } = useToast();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profileImage, setProfileImage] = useState<string>("");

  useEffect(() => {
    loadProfile();
  }, [username]);

  const loadProfile = async () => {
    if (!username) return;

    try {
      setIsLoading(true);
      const data = await api.getPublicProfile(username);
      setProfileData(data);

      // Load profile image from view_image_url
      if (data.profile_type === "personal" && data.profile.view_image_url) {
        setProfileImage(data.profile.view_image_url);
      } else if (
        data.profile_type === "company" &&
        data.profile.view_image_url
      ) {
        setProfileImage(data.profile.view_image_url);
      }
    } catch (error) {
      toast({
        title: "Profile not found",
        description: "This user profile could not be found",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <p className="text-center text-muted-foreground">
              Loading profile...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-16 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <p className="text-muted-foreground mb-4">Profile not found</p>
            <Link href="/properties">
              <Button>Browse Properties</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { user, profile, profile_type } = profileData;

  // Personal Profile View
  if (profile_type === "personal") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />

        <div className="pt-24 pb-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <Card>
              <CardHeader className="text-center pb-4">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-muted flex items-center justify-center border-4 border-primary/10">
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt={user.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-16 h-16 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-2xl mb-2">
                      {user.username}
                    </CardTitle>
                    {profile.gender && (
                      <Badge variant="secondary" className="capitalize">
                        {profile.gender}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {profile.bio && (
                  <>
                    <div>
                      <h3 className="font-semibold mb-2">About</h3>
                      <p className="text-muted-foreground">{profile.bio}</p>
                    </div>
                    <Separator />
                  </>
                )}

                <div className="space-y-3">
                  <h3 className="font-semibold">Contact Information</h3>

                  {profile.state && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">State of Origin:</span>
                      <span>{profile.state}</span>
                    </div>
                  )}

                  {profile.address && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Residential Address:</span>
                      <span>{profile.address}</span>
                    </div>
                  )}

                  {profile.date_of_birth && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {new Date(profile.date_of_birth).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Social Media Links */}
                {(profile.facebook_url ||
                  profile.x_url ||
                  profile.linkedin_url ||
                  profile.instagram_url ||
                  profile.tiktok_url) && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <h3 className="font-semibold">Social Media</h3>
                      <div className="flex flex-wrap gap-2">
                        {profile.facebook_url && (
                          <a
                            href={profile.facebook_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="outline" size="sm">
                              <Facebook className="h-4 w-4 mr-2" />
                              Facebook
                            </Button>
                          </a>
                        )}
                        {profile.x_url && (
                          <a
                            href={profile.x_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="outline" size="sm">
                              <Twitter className="h-4 w-4 mr-2" />X
                            </Button>
                          </a>
                        )}
                        {profile.linkedin_url && (
                          <a
                            href={profile.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="outline" size="sm">
                              <Linkedin className="h-4 w-4 mr-2" />
                              LinkedIn
                            </Button>
                          </a>
                        )}
                        {profile.instagram_url && (
                          <a
                            href={profile.instagram_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="outline" size="sm">
                              <Instagram className="h-4 w-4 mr-2" />
                              Instagram
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                  </>
                )}

                <Separator />

                <Link href={`/realtor/${user.username}`}>
                  <Button className="w-full">View All Properties</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Company Profile View
  if (profile_type === "company") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />

        <div className="pt-24 pb-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <Card>
              <CardHeader className="text-center pb-4">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-32 h-32 rounded-lg overflow-hidden bg-muted flex items-center justify-center border-4 border-primary/10">
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt={profile.company_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Building2 className="w-16 h-16 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-2xl mb-2">
                      {profile.company_name}
                    </CardTitle>
                    <Badge variant="secondary">Company</Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {profile.description && (
                  <>
                    <div>
                      <h3 className="font-semibold mb-2">About</h3>
                      <p className="text-muted-foreground">
                        {profile.description}
                      </p>
                    </div>
                    <Separator />
                  </>
                )}

                <div className="space-y-3">
                  <h3 className="font-semibold">Contact Information</h3>

                  {profile.website && (
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary"
                      >
                        {profile.website}
                      </a>
                    </div>
                  )}

                  {profile.address && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Company Address:</span>
                      <span>{profile.address}</span>
                    </div>
                  )}
                </div>

                {/* Social Media Links */}
                {(profile.facebook_url ||
                  profile.x_url ||
                  profile.linkedin_url ||
                  profile.instagram_url ||
                  profile.tiktok_url) && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <h3 className="font-semibold">Social Media</h3>
                      <div className="flex flex-wrap gap-2">
                        {profile.facebook_url && (
                          <a
                            href={profile.facebook_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="outline" size="sm">
                              <Facebook className="h-4 w-4 mr-2" />
                              Facebook
                            </Button>
                          </a>
                        )}
                        {profile.x_url && (
                          <a
                            href={profile.x_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="outline" size="sm">
                              <Twitter className="h-4 w-4 mr-2" />X
                            </Button>
                          </a>
                        )}
                        {profile.linkedin_url && (
                          <a
                            href={profile.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="outline" size="sm">
                              <Linkedin className="h-4 w-4 mr-2" />
                              LinkedIn
                            </Button>
                          </a>
                        )}
                        {profile.instagram_url && (
                          <a
                            href={profile.instagram_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="outline" size="sm">
                              <Instagram className="h-4 w-4 mr-2" />
                              Instagram
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                  </>
                )}

                <Separator />

                <Link href={`/realtor/${user.username}`}>
                  <Button className="w-full">View All Properties</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default ProfileView;
