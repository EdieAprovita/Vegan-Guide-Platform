import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/auth/profile-form";

export const metadata: Metadata = {
  title: "Profile",
  description: "Manage your profile settings",
};

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mx-auto max-w-4xl">
        <ProfileForm />
      </div>
    </div>
  );
}
