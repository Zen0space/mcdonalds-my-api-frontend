// Export all API services from a single entry point

// Main API configuration
export {
  api,
  apiWithExtendedTimeout,
  getApiBaseUrl,
  checkApiHealth,
} from './api'
import { api, checkApiHealth } from './api'
import { chatService } from './chat'
import { outletService } from './outlets'
export type { default as AxiosInstance } from 'axios'

// Chat service
export {
  chatService,
  createChatSession,
  sendChatMessage,
  getChatHistory,
  deleteChatSession,
  checkChatHealth,
} from './chat'

export type {
  ChatSession,
  ChatMessage,
  CreateSessionRequest,
  CreateSessionResponse,
  SendMessageRequest,
  ChatResponse,
  ChatHistory,
  ChatHealthStatus,
} from './chat'

// Outlets service
export { outletService } from './outlets'
export type {
  Outlet,
  OperatingHours,
  OutletSearchParams,
  NearbyOutletsParams,
} from './outlets'

// Re-export the legacy chat API for backward compatibility
export { chatApi } from './chatApi'

// Convenience function to test all services
export async function testAllServices() {
  const results = {
    api: false,
    chat: false,
    outlets: false,
  }

  try {
    // Test main API health
    const apiHealth = await checkApiHealth()
    results.api = apiHealth.healthy
  } catch (error) {
    console.error('API health check failed:', error)
  }

  try {
    // Test chat service
    const chatHealth = await chatService.healthCheck()
    results.chat = chatHealth.status === 'healthy'
  } catch (error) {
    console.error('Chat health check failed:', error)
  }

  try {
    // Test outlets service (just try to fetch, don't worry if empty)
    await outletService.getOutlets()
    results.outlets = true
  } catch (error) {
    console.error('Outlets service check failed:', error)
  }

  return results
}

// Export default object with all services
export default {
  api,
  chat: chatService,
  outlets: outletService,
  testAllServices,
}
