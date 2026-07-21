"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if the user is authenticated on the client side
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  // Don't render the chat UI until we confirm authentication
  if (!isAuthenticated) {
    return (
      <main className="flex flex-1 items-center justify-center p-4 h-screen">
        <div>Loading...</div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col p-4 h-screen max-w-4xl mx-auto w-full">
      <header className="py-4 border-b">
        <h1 className="text-2xl font-bold">Chat</h1>
      </header>
      
      <div className="flex-1 overflow-y-auto p-4 border rounded-md my-4">
        <p className="text-muted-foreground text-center mt-10">
          Chat messages will appear here.
        </p>
      </div>

      <div className="flex gap-2">
        <input 
          type="text" 
          placeholder="Type a message..." 
          className="flex-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
        <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
          Send
        </button>
      </div>
    </main>
  );
}
