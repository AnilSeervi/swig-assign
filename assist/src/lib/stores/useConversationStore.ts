import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { SERVICE_TYPES } from '../constants';
import { MESSAGE_TEMPLATES } from '../message-templates';
import type { APIResponse } from './useBookingStore';

interface Message {
  id: string;
  type: 'user' | 'system';
  content: string;
  timestamp: number;
}

interface Conversation {
  id: string;
  messages: Message[];
  serviceType: typeof SERVICE_TYPES[keyof typeof SERVICE_TYPES];
  status: 'pending' | 'confirmed' | 'cancelled';
  bookingReference?: string;
}

interface ConversationState {
  conversations: Conversation[];
  currentConversationId: string | null;
  isTyping: boolean;
  lastMessageId: string | null;
  activeSession: {
    sessionId: string;
    serviceType: typeof SERVICE_TYPES[keyof typeof SERVICE_TYPES];
  } | null;
}

interface ConversationActions {
  addUserMessage: (content: string) => void;
  addSystemMessage: (content: string) => void;
  setTyping: (isTyping: boolean) => void;
  clearConversation: () => void;
  setActiveConversation: (id: string | null) => void;
  createNewConversation: (serviceType: typeof SERVICE_TYPES[keyof typeof SERVICE_TYPES]) => string;
  updateLastMessage: (content: string) => void;
  setActiveSession: (sessionId: string, serviceType: typeof SERVICE_TYPES[keyof typeof SERVICE_TYPES]) => void;
  clearActiveSession: () => void;
  markConversationConfirmed: (conversationId: string, bookingReference: string) => void;
  generateSuccessMessage: (serviceType: typeof SERVICE_TYPES[keyof typeof SERVICE_TYPES], data: Record<string, any>) => string;
  generateErrorMessage: (serviceType: typeof SERVICE_TYPES[keyof typeof SERVICE_TYPES], error: string) => string;
  processAPIResponse: (serviceType: typeof SERVICE_TYPES[keyof typeof SERVICE_TYPES], apiResponse: APIResponse) => void;
}

export const useConversationStore = create<ConversationState & ConversationActions>()(
  immer((set, get) => ({
    conversations: [],
    currentConversationId: null,
    isTyping: false,
    lastMessageId: null,
    activeSession: null,

    addUserMessage: (content) =>
      set((state) => {
        const message = {
          id: `user-${Date.now()}`,
          type: 'user' as const,
          content,
          timestamp: Date.now(),
        };

        const currentConversation = state.conversations.find(c => c.id === state.currentConversationId);
        if (currentConversation) {
          currentConversation.messages.push(message);
          state.lastMessageId = message.id;
        }
      }),

    addSystemMessage: (content) =>
      set((state) => {
        const message = {
          id: `system-${Date.now()}`,
          type: 'system' as const,
          content,
          timestamp: Date.now(),
        };

        const currentConversation = state.conversations.find(c => c.id === state.currentConversationId);
        if (currentConversation) {
          currentConversation.messages.push(message);
          state.lastMessageId = message.id;
        }
      }),

    setTyping: (isTyping) =>
      set((state) => {
        state.isTyping = isTyping;
      }),

    clearConversation: () =>
      set((state) => {
        state.currentConversationId = null;
        state.lastMessageId = null;
        state.activeSession = null;
      }),

    setActiveConversation: (id) =>
      set((state) => {
        // Reset typing state when changing conversations
        state.isTyping = false;
        state.currentConversationId = id;
        if (id) {
          const conversation = state.conversations.find(c => c.id === id);
          if (conversation) {
            state.activeSession = {
              sessionId: id,
              serviceType: conversation.serviceType
            };
          }
        }
      }),

    createNewConversation: (serviceType) => {
      const newId = `conv-${Date.now()}`;
      set((state) => {
        const newConversation: Conversation = {
          id: newId,
          messages: [],
          serviceType,
          status: 'pending'
        };
        state.conversations.push(newConversation);
        state.currentConversationId = newId;
      });
      return newId;
    },

    updateLastMessage: (content) =>
      set((state) => {
        const currentConversation = state.conversations.find(c => c.id === state.currentConversationId);
        if (currentConversation) {
          const lastMessage = currentConversation.messages[currentConversation.messages.length - 1];
          if (lastMessage) {
            lastMessage.content = content;
          }
        }
      }),

    setActiveSession: (sessionId, serviceType) =>
      set((state) => {
        state.activeSession = { sessionId, serviceType };
      }),

    clearActiveSession: () =>
      set((state) => {
        state.activeSession = null;
      }),

    markConversationConfirmed: (conversationId, bookingReference) =>
      set((state) => {
        const conversation = state.conversations.find(c => c.id === conversationId);
        if (conversation) {
          conversation.status = 'confirmed';
          conversation.bookingReference = bookingReference;
        }
      }),

    generateSuccessMessage: (serviceType, data) => {
      const template = MESSAGE_TEMPLATES[serviceType]?.success;
      if (!template) {
        return `✅ Your ${serviceType} request has been processed successfully!`;
      }
      return template(data);
    },

    generateErrorMessage: (serviceType, error) => {
      const template = MESSAGE_TEMPLATES[serviceType]?.error;
      if (!template) {
        return `❌ Sorry, there was an error processing your ${serviceType} request: ${error}`;
      }
      return template(error);
    },

    processAPIResponse: (serviceType, apiResponse) =>
      set((state) => {
        if (apiResponse.success && apiResponse.data) {
          const message = get().generateSuccessMessage(serviceType, apiResponse.data);
          get().addSystemMessage(message);
          if (state.currentConversationId && apiResponse.data.booking_reference) {
            get().markConversationConfirmed(state.currentConversationId, apiResponse.data.booking_reference);
          }
        } else {
          const message = get().generateErrorMessage(serviceType, apiResponse.error || 'Unknown error');
          get().addSystemMessage(message);
        }
      }),
  })),
);
