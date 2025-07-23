import { api, apiWithExtendedTimeout } from './api';

// Types for chat functionality
export interface ChatSession {
  id: string;
  created_at: string;
  updated_at?: string;
  metadata?: Record<string, any>;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface CreateSessionRequest {
  metadata?: Record<string, any>;
}

export interface CreateSessionResponse {
  session: ChatSession;
  message: string;
}

export interface SendMessageRequest {
  session_id: string;
  message: string;
  context?: Record<string, any>;
}

export interface ChatResponse {
  message: ChatMessage;
  response: string;
  suggestions?: string[];
  context?: Record<string, any>;
}

export interface ChatHistory {
  session: ChatSession;
  messages: ChatMessage[];
  total_messages: number;
}

export interface ChatHealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  version?: string;
  details?: Record<string, any>;
}

export const chatService = {
  /**
   * Create a new chat session
   * Uses extended timeout for initial connection (Render cold start)
   */
  async createSession(request?: CreateSessionRequest): Promise<CreateSessionResponse> {
    try {
      const response = await apiWithExtendedTimeout.post<CreateSessionResponse>(
        '/api/v1/chat/session',
        request || {}
      );
      return response.data;
    } catch (error) {
      console.error('Failed to create chat session:', error);
      throw error;
    }
  },

  /**
   * Send a message to the chatbot
   */
  async sendMessage(request: SendMessageRequest): Promise<ChatResponse> {
    try {
      const response = await api.post<ChatResponse>(
        '/api/v1/chat/message',
        request
      );
      return response.data;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  },

  /**
   * Get chat history for a session
   */
  async getHistory(sessionId: string): Promise<ChatHistory> {
    try {
      const response = await api.get<ChatHistory>(
        `/api/v1/chat/history/${sessionId}`
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to get chat history for session ${sessionId}:`, error);
      throw error;
    }
  },

  /**
   * Delete a chat session
   */
  async deleteSession(sessionId: string): Promise<{ message: string }> {
    try {
      const response = await api.delete<{ message: string }>(
        `/api/v1/chat/session/${sessionId}`
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to delete session ${sessionId}:`, error);
      throw error;
    }
  },

  /**
   * Check chat service health
   */
  async healthCheck(): Promise<ChatHealthStatus> {
    try {
      const response = await api.get<ChatHealthStatus>('/api/v1/chat/health');
      return response.data;
    } catch (error) {
      console.error('Chat service health check failed:', error);
      throw error;
    }
  },

  /**
   * Stream chat response (if supported by backend)
   * This is a placeholder for future streaming implementation
   */
  async streamMessage(request: SendMessageRequest, onChunk: (chunk: string) => void): Promise<void> {
    // Note: This would require a different implementation using EventSource or WebSocket
    // For now, throwing an error to indicate it's not implemented
    throw new Error('Streaming is not yet implemented. Use sendMessage instead.');
  },

  /**
   * Get suggested prompts or questions
   */
  async getSuggestions(context?: string): Promise<string[]> {
    try {
      const response = await api.get<{ suggestions: string[] }>(
        '/api/v1/chat/suggestions',
        {
          params: { context }
        }
      );
      return response.data.suggestions;
    } catch (error) {
      console.error('Failed to get suggestions:', error);
      // Return default suggestions if API fails
      return [
        "Find McDonald's near me",
        "What are your operating hours?",
        "Do you have drive-thru service?",
        "Tell me about your delivery options",
        "What promotions are available?"
      ];
    }
  },

  /**
   * Clear all sessions (admin function)
   */
  async clearAllSessions(): Promise<{ message: string; deleted_count: number }> {
    try {
      const response = await api.delete<{ message: string; deleted_count: number }>(
        '/api/v1/chat/sessions/all'
      );
      return response.data;
    } catch (error) {
      console.error('Failed to clear all sessions:', error);
      throw error;
    }
  }
};

// Export individual functions for backward compatibility
export const createChatSession = chatService.createSession;
export const sendChatMessage = chatService.sendMessage;
export const getChatHistory = chatService.getHistory;
export const deleteChatSession = chatService.deleteSession;
export const checkChatHealth = chatService.healthCheck;

export default chatService;
