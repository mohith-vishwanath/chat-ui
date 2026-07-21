"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Hexagon, MessageSquare, User } from "lucide-react";

interface Chat {
  id: string;
  title: string;
  last_used_at: string;
  workflow_id: string;
}

interface UserProfile {
  first_name: string;
  last_name: string;
  email: string;
}

export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [chatsError, setChatsError] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchChats = async (token: string) => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "";
        const response = await fetch(`${backendUrl}/api/chats`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          }
        });

        if (!response.ok) {
          throw new Error("Failed to fetch chats");
        }

        const data = await response.json();
        setChats(data);
      } catch (err) {
        console.error(err);
        setChatsError(true);
      } finally {
        setIsLoadingChats(false);
      }
    };

    const fetchProfile = async (token: string) => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "";
        const response = await fetch(`${backendUrl}/api/auth/me`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUserProfile(data);
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      }
    };

    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
    } else {
      setIsAuthenticated(true);
      fetchChats(token);
      fetchProfile(token);
    }
  }, [router]);

  if (!isAuthenticated) {
    return (
      <main className="flex flex-1 items-center justify-center p-4 h-screen">
        <div>Loading...</div>
      </main>
    );
  }

  const userInitial = userProfile?.first_name?.[0]?.toUpperCase() || "";
  const fullName = userProfile ? `${userProfile.first_name} ${userProfile.last_name}` : "User";

  return (
    <div className="flex h-screen w-full bg-background">
      {/* Left Panel - Sidebar */}
      <aside className="w-64 border-r flex flex-col bg-muted/20">
        {/* Company Logo Header */}
        <div className="h-16 flex items-center px-4 border-b">
          <div className="flex items-center gap-2 font-bold text-lg">
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
                  className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-muted text-sm text-left transition-colors"
                >
                  <MessageSquare className="w-4 h-4 text-muted-foreground shrink-0" />
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

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col h-screen min-w-0">
        <header className="h-16 flex items-center px-6 border-b shrink-0">
          <h1 className="text-xl font-semibold">Current Chat</h1>
        </header>
        
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground text-center">
              Chat messages will appear here.
            </p>
          </div>
        </div>

        <div className="p-4 bg-background border-t">
          <div className="flex gap-2 max-w-4xl mx-auto w-full">
            <input 
              type="text" 
              placeholder="Type a message..." 
              className="flex-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 shrink-0">
              Send
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
