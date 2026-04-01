"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { updateProfileSchema, UpdateProfileFormData } from "@/lib/validations/auth";
import { toast } from "sonner";
import { User as UserIcon, Camera } from "lucide-react";
import { User } from "@/types";
import { useAuthWithRouter } from "@/hooks/useAuth";
import { LogoutButton } from "./logout-button";

export function ProfileForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [originalValues, setOriginalValues] = useState<UpdateProfileFormData | null>(null);
  const { user: sessionUser, isAuthenticated, status } = useAuthWithRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
  });

  useEffect(() => {
    const loadProfile = async () => {
      if (!isAuthenticated) {
        setIsLoadingProfile(false);
        return;
      }

      try {
        const response = await fetch("/api/user/profile");
        if (!response.ok) throw new Error("Failed to load profile");
        const profile = await response.json();
        setUser(profile);
        const values: UpdateProfileFormData = {
          username: profile.username,
          email: profile.email,
          photo: profile.photo ?? "",
          firstName: profile.firstName ?? "",
          lastName: profile.lastName ?? "",
          bio: profile.bio ?? "",
          phone: profile.phone ?? "",
        };
        Object.entries(values).forEach(([key, val]) => {
          setValue(key as keyof UpdateProfileFormData, val as string);
        });
        setOriginalValues(values);
      } catch (error) {
        console.error("Failed to load profile:", error);
        toast.error("Failed to load profile");
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadProfile();
  }, [setValue, isAuthenticated]);

  const handleUpdateProfile = async (data: UpdateProfileFormData) => {
    if (!user || !isAuthenticated) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update profile");
      }

      const updatedUser = await response.json();
      setUser((prev) => (prev ? { ...prev, ...updatedUser } : null));
      const newValues: UpdateProfileFormData = {
        username: updatedUser.username ?? data.username,
        email: updatedUser.email ?? data.email,
        photo: updatedUser.photo ?? data.photo ?? "",
        firstName: updatedUser.firstName ?? data.firstName ?? "",
        lastName: updatedUser.lastName ?? data.lastName ?? "",
        bio: updatedUser.bio ?? data.bio ?? "",
        phone: updatedUser.phone ?? data.phone ?? "",
      };
      setOriginalValues(newValues);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (originalValues) {
      reset(originalValues);
    }
  };

  if (!isAuthenticated) {
    return (
      <Card className="mx-auto w-full max-w-2xl">
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-gray-500">Please log in to view your profile.</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoadingProfile) {
    return (
      <Card className="mx-auto w-full max-w-2xl">
        <CardContent className="flex items-center justify-center py-8">
          <div
            role="status"
            aria-label="Cargando perfil"
            className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"
          >
            <span className="sr-only">Cargando perfil...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">Profile Settings</CardTitle>
            <CardDescription>Update your profile information and preferences.</CardDescription>
          </div>
          <LogoutButton variant="outline" size="sm" />
        </div>
      </CardHeader>
      <CardContent>
        {/* Debug info */}
        <div className="mb-4 rounded bg-gray-100 p-3 text-sm">
          <p>
            <strong>Status:</strong> {status}
          </p>
          <p>
            <strong>Authenticated:</strong> {isAuthenticated ? "Yes" : "No"}
          </p>
          <p>
            <strong>Has Session:</strong> {isAuthenticated ? "Yes" : "No"}
          </p>
          <p>
            <strong>User ID:</strong> {sessionUser?.id || "None"}
          </p>
        </div>

        <form onSubmit={handleSubmit(handleUpdateProfile)} className="space-y-6" noValidate>
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
              <p className="text-muted-foreground mt-1 text-sm">JPG, PNG or GIF. Max size 2MB.</p>
            </div>
          </div>

          {/* First Name */}
          <div className="space-y-2">
            <Label htmlFor="profile-firstName">First Name</Label>
            <Input
              id="profile-firstName"
              placeholder="Enter your first name"
              maxLength={50}
              aria-invalid={!!errors.firstName}
              aria-describedby={errors.firstName ? "profile-firstName-error" : undefined}
              {...register("firstName")}
              className={errors.firstName ? "border-red-500" : ""}
            />
            {errors.firstName && (
              <p id="profile-firstName-error" role="alert" className="text-sm text-red-500">
                {errors.firstName.message}
              </p>
            )}
          </div>

          {/* Last Name */}
          <div className="space-y-2">
            <Label htmlFor="profile-lastName">Last Name</Label>
            <Input
              id="profile-lastName"
              placeholder="Enter your last name"
              maxLength={50}
              aria-invalid={!!errors.lastName}
              aria-describedby={errors.lastName ? "profile-lastName-error" : undefined}
              {...register("lastName")}
              className={errors.lastName ? "border-red-500" : ""}
            />
            {errors.lastName && (
              <p id="profile-lastName-error" role="alert" className="text-sm text-red-500">
                {errors.lastName.message}
              </p>
            )}
          </div>

          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="profile-username">
              Username{" "}
              <span aria-label="required" className="text-red-500">
                *
              </span>
            </Label>
            <Input
              id="profile-username"
              placeholder="Enter your username"
              aria-required="true"
              aria-invalid={!!errors.username}
              aria-describedby={errors.username ? "profile-username-error" : undefined}
              {...register("username")}
              className={errors.username ? "border-red-500" : ""}
            />
            {errors.username && (
              <p id="profile-username-error" role="alert" className="text-sm text-red-500">
                {errors.username.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="profile-email">
              Email{" "}
              <span aria-label="required" className="text-red-500">
                *
              </span>
            </Label>
            <Input
              id="profile-email"
              type="email"
              placeholder="Enter your email"
              aria-required="true"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "profile-email-error" : undefined}
              {...register("email")}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p id="profile-email-error" role="alert" className="text-sm text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="profile-phone">Phone</Label>
            <Input
              id="profile-phone"
              type="tel"
              placeholder="Enter your phone number"
              aria-invalid={!!errors.phone}
              aria-describedby={errors.phone ? "profile-phone-error" : undefined}
              {...register("phone")}
              className={errors.phone ? "border-red-500" : ""}
            />
            {errors.phone && (
              <p id="profile-phone-error" role="alert" className="text-sm text-red-500">
                {errors.phone.message}
              </p>
            )}
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="profile-bio">Bio</Label>
            <Textarea
              id="profile-bio"
              placeholder="Tell us about yourself"
              maxLength={500}
              rows={4}
              aria-invalid={!!errors.bio}
              aria-describedby={errors.bio ? "profile-bio-error" : undefined}
              {...register("bio")}
              className={errors.bio ? "border-red-500" : ""}
            />
            {errors.bio && (
              <p id="profile-bio-error" role="alert" className="text-sm text-red-500">
                {errors.bio.message}
              </p>
            )}
          </div>

          {/* Photo URL */}
          <div className="space-y-2">
            <Label htmlFor="profile-photo">Profile Photo URL</Label>
            <Input
              id="profile-photo"
              type="url"
              placeholder="Enter photo URL"
              aria-invalid={!!errors.photo}
              aria-describedby={errors.photo ? "profile-photo-error" : undefined}
              {...register("photo")}
              className={errors.photo ? "border-red-500" : ""}
            />
            {errors.photo && (
              <p id="profile-photo-error" role="alert" className="text-sm text-red-500">
                {errors.photo.message}
              </p>
            )}
          </div>

          {/* User Info Display */}
          <div className="rounded-lg bg-gray-50 p-4">
            <h3 className="mb-2 font-medium">Account Information</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p>
                <strong>Role:</strong> {user?.role}
              </p>
              <p>
                <strong>Member since:</strong>{" "}
                {user ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Profile"}
            </Button>
            <Button type="button" variant="outline" onClick={handleCancel} disabled={isLoading}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
