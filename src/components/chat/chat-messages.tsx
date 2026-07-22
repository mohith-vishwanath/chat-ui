"use client";

import { useEffect, useState, useRef } from "react";
import { ArrowUp, Hexagon } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setMessagesLoading, setMessagesError, setChatMessages, addMessageToChat, Message } from "@/store/chatSlice";

export function ChatMessages() {
  const dispatch = useAppDispatch();
  const { selectedChatId, messagesByChatId, isLoadingMessages, messagesError } = useAppSelector((state) => state.chat);
  
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeMessages = selectedChatId ? (messagesByChatId[selectedChatId] || []) : [];
  const isLoading = selectedChatId ? !!isLoadingMessages[selectedChatId] : false;
  const hasError = selectedChatId ? !!messagesError[selectedChatId] : false;
  
  // A new chat is when no chat is selected OR a chat is selected but has absolutely no messages yet.
  const isNewChat = !selectedChatId || (activeMessages.length === 0 && !isLoading);

  useEffect(() => {
    // If we select a chat and we haven't fetched its messages yet, fetch them.
    const fetchMessages = async () => {
      if (!selectedChatId || messagesByChatId[selectedChatId]) return;

      const token = localStorage.getItem("access_token");
      if (!token) return;

      dispatch(setMessagesLoading({ chatId: selectedChatId, isLoading: true }));
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "";
        const response = await fetch(`${backendUrl}/api/chats/${selectedChatId}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          }
        });

        if (!response.ok) {
          throw new Error("Failed to fetch messages");
        }

        const data = await response.json();
        // Assuming the backend returns an object with a messages array
        const fetchedMessages: Message[] = data.messages || [];
        dispatch(setChatMessages({ chatId: selectedChatId, messages: fetchedMessages }));
      } catch (err) {
        console.error("Error fetching messages:", err);
        dispatch(setMessagesError({ chatId: selectedChatId, error: true }));
        dispatch(setMessagesLoading({ chatId: selectedChatId, isLoading: false }));
      }
    };

    fetchMessages();
  }, [selectedChatId, dispatch, messagesByChatId]);

  useEffect(() => {
    // Scroll to bottom whenever messages update
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages]);

  const handleSendMessage = () => {
    if (!messageText.trim()) return;

    // Simulate optimistic UI update
    const newMessage: Message = {
      role: 'user',
      content: messageText.trim(),
      timestamp: new Date().toISOString(),
    };

    if (selectedChatId) {
      dispatch(addMessageToChat({ chatId: selectedChatId, message: newMessage }));
      // Here you would also dispatch a thunk to actually send the message to the backend via POST
    } else {
      // Logic for initiating a completely new chat (create chat, then send message)
      console.log("Create new chat and send message:", messageText);
    }

    setMessageText("");
  };

  const renderInput = (isCentered: boolean) => (
    <div className={`w-full max-w-4xl mx-auto ${isCentered ? 'mt-8' : ''}`}>
      <div className="relative flex items-center shadow-sm">
        <input 
          type="text" 
          placeholder="Type a message..." 
          value={messageText || ""}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSendMessage();
          }}
          className="flex-1 flex h-14 w-full rounded-full border border-input bg-background px-5 py-2 pr-14 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
        <button 
          onClick={handleSendMessage}
          disabled={!messageText || messageText.trim() === ""}
          className="absolute right-1.5 inline-flex items-center justify-center rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 w-11 h-11 shrink-0"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      </div>
      {isCentered && (
        <p className="text-center text-xs text-muted-foreground mt-4">
          AI can make mistakes. Verify important information.
        </p>
      )}
    </div>
  );

  return (
    <main className="flex-1 flex flex-col h-screen min-w-0 bg-background">
      {/* Dynamic Header */}
      {!isNewChat && (
        <header className="h-16 flex items-center px-6 border-b shrink-0">
          <h1 className="text-xl font-semibold">Current Chat</h1>
        </header>
      )}

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto">
        {isNewChat ? (
          <div className="flex flex-col items-center justify-center h-full max-w-3xl mx-auto px-4">
            <div className="bg-primary text-primary-foreground p-3 rounded-2xl mb-6 shadow-md">
              <Hexagon className="w-12 h-12 fill-current" />
            </div>
            <h2 className="text-2xl font-bold mb-2">How can I help you today?</h2>
            <p className="text-muted-foreground text-center mb-4">
              Send a message to start a new conversation.
            </p>
            {renderInput(true)}
          </div>
        ) : (
          <div className="p-6 max-w-4xl mx-auto w-full flex flex-col gap-6 pb-8">
            {isLoading && (
              <div className="text-center text-muted-foreground py-10">
                Loading messages...
              </div>
            )}
            
            {hasError && (
              <div className="text-center text-destructive py-10">
                Failed to load chat messages.
              </div>
            )}

            {!isLoading && !hasError && activeMessages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                    msg.role === 'user' 
                      ? 'bg-foreground text-background' 
                      : 'bg-muted/60 text-foreground'
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Bottom Input Area - Only shown when not in new chat mode */}
      {!isNewChat && (
        <div className="p-4 bg-background border-t">
          {renderInput(false)}
        </div>
      )}
    </main>
  );
}
