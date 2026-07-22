import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Chat {
  id: string;
  title: string;
  last_used_at: string;
  workflow_id: string;
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
  type?: string;
}

interface ChatState {
  chats: Chat[];
  isLoadingChats: boolean;
  chatsError: boolean;
  selectedChatId: string | null;
  messagesByChatId: Record<string, Message[]>;
  isLoadingMessages: Record<string, boolean>;
  messagesError: Record<string, boolean>;
}

const initialState: ChatState = {
  chats: [],
  isLoadingChats: true,
  chatsError: false,
  selectedChatId: null,
  messagesByChatId: {},
  isLoadingMessages: {},
  messagesError: {},
};

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setChatsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoadingChats = action.payload;
    },
    setChatsError: (state, action: PayloadAction<boolean>) => {
      state.chatsError = action.payload;
    },
    setChats: (state, action: PayloadAction<Chat[]>) => {
      state.chats = action.payload;
      state.isLoadingChats = false;
      state.chatsError = false;
    },
    setSelectedChatId: (state, action: PayloadAction<string | null>) => {
      state.selectedChatId = action.payload;
    },
    setMessagesLoading: (state, action: PayloadAction<{ chatId: string; isLoading: boolean }>) => {
      state.isLoadingMessages[action.payload.chatId] = action.payload.isLoading;
    },
    setMessagesError: (state, action: PayloadAction<{ chatId: string; error: boolean }>) => {
      state.messagesError[action.payload.chatId] = action.payload.error;
    },
    setChatMessages: (state, action: PayloadAction<{ chatId: string; messages: Message[] }>) => {
      state.messagesByChatId[action.payload.chatId] = action.payload.messages;
      state.isLoadingMessages[action.payload.chatId] = false;
      state.messagesError[action.payload.chatId] = false;
    },
    addMessageToChat: (state, action: PayloadAction<{ chatId: string; message: Message }>) => {
      if (!state.messagesByChatId[action.payload.chatId]) {
        state.messagesByChatId[action.payload.chatId] = [];
      }
      state.messagesByChatId[action.payload.chatId].push(action.payload.message);
    }
  },
});

export const { 
  setChatsLoading, 
  setChatsError, 
  setChats, 
  setSelectedChatId,
  setMessagesLoading,
  setMessagesError,
  setChatMessages,
  addMessageToChat
} = chatSlice.actions;

export default chatSlice.reducer;
