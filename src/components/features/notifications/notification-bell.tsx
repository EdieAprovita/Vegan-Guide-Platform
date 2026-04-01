"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useSession } from "next-auth/react";

export function NotificationBell() {
  const { data: session } = useSession();
  const user = session?.user;
  const [isOpen, setIsOpen] = useState(false);

  if (!user) {
    return null;
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="border-b p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Notifications</h3>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <Bell className="text-muted-foreground/60 mx-auto mb-4 h-8 w-8 opacity-50" />
          <h3 className="mb-1 text-sm font-semibold">Próximamente</h3>
          <p className="text-muted-foreground text-xs">Esta función estará disponible pronto.</p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
