"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, MessageCircle, Paperclip } from "lucide-react";
import { useAuthStore } from "@/lib/store/auth";
import { toast } from "sonner";

interface Message {
  id: string;
  content: string;
  sender: {
    id: string;
    username: string;
    avatar?: string;
  };
  timestamp: Date;
  type: "text" | "image" | "file";
  isRead: boolean;
}

interface ChatRoom {
  id: string;
  name: string;
  type: "direct" | "group" | "community";
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
}

interface ChatSystemProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChatSystem({ isOpen, onClose }: ChatSystemProps) {
  const { user } = useAuthStore();
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadMockData = useCallback(() => {
    if (activeRoom) {
      const mockMessages: Message[] = [
        {
          id: "1",
          content: "Hello everyone! 👋",
          sender: { id: "user2", username: "Sarah" },
          timestamp: new Date(Date.now() - 1000 * 60 * 10),
          type: "text",
          isRead: true,
        },
        {
          id: "2",
          content: "Hi Sarah! How's your vegan journey going?",
          sender: { id: user?._id || "user1", username: user?.username || "You" },
          timestamp: new Date(Date.now() - 1000 * 60 * 8),
          type: "text",
          isRead: true,
        },
      ];

      setMessages(mockMessages);
    }
  }, [activeRoom, user?._id, user?.username]);

  useEffect(() => {
    if (isOpen) {
      loadChatRooms();
      loadMockData();
    }
  }, [isOpen, loadMockData]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatRooms = async () => {
    const mockRooms: ChatRoom[] = [
      {
        id: "1",
        name: "Vegan Community",
        type: "community",
        participants: ["user1", "user2", "user3"],
        unreadCount: 3,
        lastMessage: {
          id: "msg1",
          content: "Anyone tried the new vegan restaurant downtown?",
          sender: { id: "user2", username: "Sarah" },
          timestamp: new Date(Date.now() - 1000 * 60 * 5),
          type: "text",
          isRead: false,
        },
      },
      {
        id: "2",
        name: "Recipe Exchange",
        type: "group",
        participants: ["user1", "user4", "user5"],
        unreadCount: 0,
        lastMessage: {
          id: "msg2",
          content: "Here's my favorite vegan lasagna recipe!",
          sender: { id: "user4", username: "Mike" },
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
          type: "text",
          isRead: true,
        },
      },
    ];

    setChatRooms(mockRooms);
    setOnlineUsers(["user1", "user2", "user4"]);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeRoom || !user) return;

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage,
      sender: {
        id: user._id,
        username: user.username,
        avatar: user.photo,
      },
      timestamp: new Date(),
      type: "text",
      isRead: false,
    };

    setMessages((prev) => [...prev, message]);
    setNewMessage("");

    toast.success("Message sent!");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="flex h-[80vh] w-full max-w-4xl flex-col">
        <CardHeader className="flex-shrink-0 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageCircle className="h-5 w-5 text-green-600" />
              <CardTitle>Vegan Guide Chat</CardTitle>
              <Badge variant="outline" className="text-xs">
                {onlineUsers.length} online
              </Badge>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          </div>
        </CardHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* Chat Rooms Sidebar */}
          <div className="flex w-80 flex-col border-r">
            <div className="border-b p-4">
              <Input placeholder="Search conversations..." />
            </div>

            <ScrollArea className="flex-1">
              <div className="space-y-1 p-2">
                {chatRooms.map((room) => (
                  <div
                    key={room.id}
                    className={`cursor-pointer rounded-lg p-3 transition-colors ${
                      activeRoom?.id === room.id
                        ? "border border-green-200 bg-green-100"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => {
                      setActiveRoom(room);
                      loadMockData();
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{room.name.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{room.name}</p>
                          {room.lastMessage && (
                            <p className="truncate text-xs text-gray-500">
                              {room.lastMessage.sender.username}: {room.lastMessage.content}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {room.lastMessage && (
                          <span className="text-xs text-gray-400">
                            {formatTime(room.lastMessage.timestamp)}
                          </span>
                        )}
                        {room.unreadCount > 0 && (
                          <Badge variant="destructive" className="h-5 w-5 rounded-full p-0 text-xs">
                            {room.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Chat Area */}
          <div className="flex flex-1 flex-col">
            {activeRoom ? (
              <>
                {/* Chat Header */}
                <div className="flex items-center justify-between border-b p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{activeRoom.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{activeRoom.name}</h3>
                      <p className="text-sm text-gray-500">
                        {activeRoom.participants.length} participants
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${
                          message.sender.id === user?._id ? "justify-end" : "justify-start"
                        }`}
                      >
                        {message.sender.id !== user?._id && (
                          <Avatar className="h-8 w-8 flex-shrink-0">
                            <AvatarFallback>
                              {message.sender.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div
                          className={`max-w-xs lg:max-w-md ${
                            message.sender.id === user?._id
                              ? "bg-green-600 text-white"
                              : "bg-gray-100"
                          } rounded-lg p-3`}
                        >
                          {message.sender.id !== user?._id && (
                            <p className="mb-1 text-xs font-medium text-gray-600">
                              {message.sender.username}
                            </p>
                          )}
                          <p className="text-sm">{message.content}</p>
                          <p className="mt-1 text-xs opacity-70">{formatTime(message.timestamp)}</p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="border-t p-4">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Input
                      ref={inputRef}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type a message..."
                      className="flex-1"
                    />
                    <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center text-gray-500">
                <div className="text-center">
                  <MessageCircle className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                  <p>Select a conversation to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
