"use client";

import { AlertCircle, Hexagon, MessageSquare, User } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setSelectedChatId } from "@/store/chatSlice";

interface UserProfile {
  first_name: string;
  last_name: string;
  email: string;
}

interface ChatSidebarProps {
  userProfile: UserProfile | null;
}

export function ChatSidebar({ userProfile }: ChatSidebarProps) {
  const dispatch = useAppDispatch();
  const { chats, isLoadingChats, chatsError, selectedChatId } = useAppSelector((state) => state.chat);

  const userInitial = userProfile?.first_name?.[0]?.toUpperCase() || "";
  const fullName = userProfile ? `${userProfile.first_name} ${userProfile.last_name}`.trim() : "User";

  return (
    <aside className="w-64 border-r flex flex-col bg-muted/20">
      {/* Company Logo Header */}
      <div className="h-16 flex items-center px-4 border-b">
        <div className="flex items-center gap-2 font-bold text-lg cursor-pointer" onClick={() => dispatch(setSelectedChatId(null))}>
          <div className="bg-primary text-primary-foreground p-1 rounded-md">
            <Hexagon className="w-5 h-5 fill-current" />
          </div>
          Company UI
        </div>
      </div>

      {/* Chat List Area */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">
          Your Chats
        </div>
        
        {isLoadingChats ? (
          <div className="px-2 text-sm text-muted-foreground">Loading chats...</div>
        ) : chatsError ? (
          <div className="px-2 py-4 flex flex-col items-center justify-center text-center text-sm text-destructive gap-2">
            <AlertCircle className="w-8 h-8 opacity-80" />
            <p>Unable to fetch chats right now.</p>
          </div>
        ) : chats.length === 0 ? (
          <div className="px-2 py-4 text-center text-sm text-muted-foreground">
            No chats present.
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {chats.map((chat) => (
              <button 
                key={chat.id}
                onClick={() => dispatch(setSelectedChatId(chat.id))}
                className={`flex items-center gap-2 px-2 py-2 rounded-md text-sm text-left transition-colors ${
                  selectedChatId === chat.id 
                    ? "bg-muted font-medium text-foreground" 
                    : "hover:bg-muted/50 text-muted-foreground"
                }`}
              >
                <MessageSquare className="w-4 h-4 shrink-0" />
                <span className="truncate">{chat.title}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* User Profile Footer */}
      <div className="p-4 border-t bg-muted/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0">
            {userInitial || <User className="w-4 h-4" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{fullName}</p>
            <p className="text-xs text-muted-foreground truncate">{userProfile?.email || ""}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
