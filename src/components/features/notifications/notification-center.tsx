"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Bell } from "lucide-react";
import { useSession } from "next-auth/react";

export function NotificationCenter() {
  const { data: session } = useSession();
  const user = session?.user;

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl text-center">
          <Bell className="text-muted-foreground/60 mx-auto mb-4 h-16 w-16" />
          <h2 className="text-foreground mb-2 text-2xl font-bold">Sign in to view notifications</h2>
          <p className="text-muted-foreground">Please sign in to access your notifications.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-foreground mb-2 text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">Stay updated with your community activity</p>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <div className="text-muted-foreground mb-2">
              <Bell className="mx-auto mb-4 h-12 w-12 opacity-50" />
            </div>
            <h3 className="mb-1 text-lg font-semibold">Próximamente</h3>
            <p className="text-muted-foreground text-sm">Esta función estará disponible pronto.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
