"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { setChats, setChatsError, setChatsLoading } from "@/store/chatSlice";
import { setUserProfile } from "@/store/userSlice";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { ChatMessages } from "@/components/chat/chat-messages";

export default function Home() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const fetchChats = async (token: string) => {
      dispatch(setChatsLoading(true));
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
        dispatch(setChats(data));
      } catch (err) {
        console.error(err);
        dispatch(setChatsError(true));
      } finally {
        dispatch(setChatsLoading(false));
      }
    };

    const fetchProfile = async (token: string) => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "";
        const response = await fetch(`${backendUrl}/api/user`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          }
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user profile");
        }

        const data = await response.json();
        dispatch(setUserProfile({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          email: data.email || ""
        }));
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        router.push("/login");
      }
    };

    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
    } else {
      setIsAuthenticated(true);
      fetchProfile(token);
      fetchChats(token);
    }
  }, [router, dispatch]);

  if (!isAuthenticated) {
    return (
      <main className="flex flex-1 items-center justify-center p-4 h-screen">
        <div>Loading...</div>
      </main>
    );
  }

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <ChatSidebar />
      <ChatMessages />
    </div>
  );
}
