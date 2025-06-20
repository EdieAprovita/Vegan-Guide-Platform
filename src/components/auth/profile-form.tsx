"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { updateProfileSchema, UpdateProfileFormData } from "@/lib/validations/auth";
import { getUserProfile } from "@/lib/api/auth";
import { toast } from "sonner";
import { User as UserIcon, Camera } from "lucide-react";
import { User } from "@/types";
import { useAuthWithRouter } from "@/hooks/useAuth";
import { LogoutButton } from "./logout-button";

export function ProfileForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const { user: sessionUser, isAuthenticated, status, updateProfile } = useAuthWithRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
  });

  // Debug logs
  useEffect(() => {
    console.log("ProfileForm Debug:", {
      status,
      isAuthenticated,
      hasSession: !!sessionUser,
      hasToken: !!sessionUser?.token,
      token: sessionUser?.token ? "Token exists" : "No token",
      user: sessionUser
    });
  }, [sessionUser, status, isAuthenticated]);

  useEffect(() => {
    const loadProfile = async () => {
      console.log("loadProfile called:", {
        isAuthenticated,
        hasToken: !!sessionUser?.token,
        token: sessionUser?.token
      });

      if (!isAuthenticated || !sessionUser?.token) {
        console.log("Not authenticated or no token, skipping profile load");
        setIsLoadingProfile(false);
        return;
      }

      try {
        console.log("Calling getUserProfile with token:", sessionUser.token.substring(0, 20) + "...");
        const profile = await getUserProfile("current", sessionUser.token);
        console.log("Profile loaded successfully:", profile);
        setUser(profile);
        setValue("username", profile.username);
        setValue("email", profile.email);
        setValue("photo", profile.photo);
      } catch (error) {
        console.error("Failed to load profile:", error);
        toast.error("Failed to load profile");
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadProfile();
  }, [setValue, isAuthenticated, sessionUser?.token]);

  const handleUpdateProfile = async (data: UpdateProfileFormData) => {
    if (!user || !isAuthenticated || !sessionUser?.token) return;
    
    setIsLoading(true);
    try {
      await updateProfile(data);
      setUser(prev => prev ? { ...prev, ...data } : null);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-gray-500">Please log in to view your profile.</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoadingProfile) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-2xl font-bold">Profile Settings</CardTitle>
            <CardDescription>
              Update your profile information and preferences.
            </CardDescription>
          </div>
          <LogoutButton variant="outline" size="sm" />
        </div>
      </CardHeader>
      <CardContent>
        {/* Debug info */}
        <div className="mb-4 p-3 bg-gray-100 rounded text-sm">
          <p><strong>Status:</strong> {status}</p>
          <p><strong>Authenticated:</strong> {isAuthenticated ? "Yes" : "No"}</p>
          <p><strong>Has Token:</strong> {sessionUser?.token ? "Yes" : "No"}</p>
          <p><strong>User ID:</strong> {sessionUser?.id || "None"}</p>
        </div>

        <form onSubmit={handleSubmit(handleUpdateProfile)} className="space-y-6">
          {/* Profile Picture */}
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user?.photo} alt={user?.username} />
              <AvatarFallback>
                <UserIcon className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            <div>
              <Button type="button" variant="outline" size="sm">
                <Camera className="mr-2 h-4 w-4" />
                Change Photo
              </Button>
              <p className="text-sm text-muted-foreground mt-1">
                JPG, PNG or GIF. Max size 2MB.
              </p>
            </div>
          </div>

          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="Enter your username"
              {...register("username")}
              className={errors.username ? "border-red-500" : ""}
            />
            {errors.username && (
              <p className="text-sm text-red-500">{errors.username.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              {...register("email")}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Photo URL */}
          <div className="space-y-2">
            <Label htmlFor="photo">Profile Photo URL</Label>
            <Input
              id="photo"
              type="url"
              placeholder="Enter photo URL"
              {...register("photo")}
              className={errors.photo ? "border-red-500" : ""}
            />
            {errors.photo && (
              <p className="text-sm text-red-500">{errors.photo.message}</p>
            )}
          </div>

          {/* User Info Display */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Account Information</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p><strong>Role:</strong> {user?.role}</p>
              <p><strong>Member since:</strong> {user ? new Date(user.createdAt).toLocaleDateString() : "N/A"}</p>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Updating..." : "Update Profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 