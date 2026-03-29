"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

interface ChatSystemProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChatSystem({ isOpen, onClose }: ChatSystemProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="flex h-[80vh] w-full max-w-4xl flex-col">
        <CardHeader className="flex-shrink-0 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageCircle className="h-5 w-5 text-green-600" />
              <CardTitle>Vegan Guide Chat</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          </div>
        </CardHeader>

        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="text-muted-foreground mb-2">
              <MessageCircle className="mx-auto mb-4 h-12 w-12 opacity-50" />
            </div>
            <h3 className="mb-1 text-lg font-semibold">Próximamente</h3>
            <p className="text-muted-foreground text-sm">Esta función estará disponible pronto.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
