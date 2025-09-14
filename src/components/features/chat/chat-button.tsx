"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle } from "lucide-react";
import { ChatSystem } from "./chat-system";

export function ChatButton() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3); // Mock unread count

  const handleOpenChat = () => {
    setIsChatOpen(true);
    setUnreadCount(0); // Clear unread count when opening
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
  };

  return (
    <>
      <Button
        onClick={handleOpenChat}
        className="fixed right-6 bottom-6 z-40 h-14 w-14 rounded-full bg-green-600 shadow-lg hover:bg-green-700"
        size="lg"
      >
        <MessageCircle className="h-6 w-6" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full p-0 text-xs"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
      </Button>

      <ChatSystem isOpen={isChatOpen} onClose={handleCloseChat} />
    </>
  );
}
