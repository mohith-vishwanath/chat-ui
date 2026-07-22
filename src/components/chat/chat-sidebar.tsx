"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Hexagon, MessageSquare, User, Sparkles, MessageCircle } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setSelectedChatId } from "@/store/chatSlice";

interface Workflow {
  workflow_id: string;
  name: string;
}

export function ChatSidebar() {
  const dispatch = useAppDispatch();
  const { chats, isLoadingChats, chatsError, selectedChatId } = useAppSelector((state) => state.chat);
  const userProfile = useAppSelector((state) => state.user.profile);

  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [isLoadingWorkflows, setIsLoadingWorkflows] = useState(true);
  const [workflowsError, setWorkflowsError] = useState(false);

  useEffect(() => {
    const fetchWorkflows = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) return;

        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "";
        const response = await fetch(`${backendUrl}/api/workflows`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          }
        });

        if (!response.ok) {
          throw new Error("Failed to fetch workflows");
        }

        const data = await response.json();
        setWorkflows(data);
      } catch (err) {
        console.error(err);
        setWorkflowsError(true);
      } finally {
        setIsLoadingWorkflows(false);
      }
    };

    fetchWorkflows();
  }, []);

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

      {/* Sidebar Content */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-6">
        {/* Agents Marketplace Section */}
        <div>
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2 flex items-center gap-2">
            <Sparkles className="w-3 h-3" />
            Agents Marketplace
          </div>
          
          {isLoadingWorkflows ? (
            <div className="px-2 text-sm text-muted-foreground">Loading agents...</div>
          ) : workflowsError ? (
            <div className="px-2 text-sm text-destructive">Failed to load agents</div>
          ) : workflows.length === 0 ? (
            <div className="px-2 text-sm text-muted-foreground">No agents available.</div>
          ) : (
            <div className="flex flex-col gap-1">
              {workflows.map((workflow) => (
                <button 
                  key={workflow.workflow_id}
                  className="flex items-center px-2 py-2 rounded-md hover:bg-muted/50 text-muted-foreground text-sm text-left transition-colors cursor-pointer"
                >
                  <span className="truncate">{workflow.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Chat List Section */}
        <div>
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2 flex items-center gap-2">
            <MessageCircle className="w-3 h-3" />
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
                  className={`flex items-center gap-2 px-2 py-2 rounded-md text-sm text-left transition-colors cursor-pointer ${
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
