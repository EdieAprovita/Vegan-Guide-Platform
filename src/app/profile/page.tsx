import { Metadata } from "next"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Profile",
  description: "Manage your profile settings",
}

export default async function ProfilePage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold font-['Playfair_Display'] text-green-800 mb-6">
            Profile
          </h1>
          
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <img
                src={session.user.image || "https://res.cloudinary.com/dzqbzqgjm/image/upload/v1599098981/default-user_qjqjqz.png"}
                alt={session.user.name || "Profile"}
                className="w-20 h-20 rounded-full"
              />
              <div>
                <h2 className="text-2xl font-semibold font-['Playfair_Display']">{session.user.name}</h2>
                <p className="text-gray-600">{session.user.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold font-['Playfair_Display']">Account Information</h3>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Username</p>
                  <p className="font-medium">{session.user.name}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{session.user.email}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Role</p>
                  <p className="font-medium capitalize">{session.user.role || "User"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 