import axios from 'axios'

// Get API URL from environment variable with fallback to proxy in development
const API_BASE_URL =
  process.env.NODE_ENV === 'development'
    ? '' // Use Next.js proxy in development
    : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Create axios instance with base configuration
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds (important for Render free tier)
})

// Add request interceptor for logging and auth (if needed)
api.interceptors.request.use(
  config => {
    // Log requests in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`)
    }

    // Add auth token if available (placeholder for future use)
    // const token = getAuthToken();
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }

    return config
  },
  error => {
    console.error('[API Request Error]', error)
    return Promise.reject(error)
  }
)

// Add response interceptor for error handling
api.interceptors.response.use(
  response => {
    // Log successful responses in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Response] ${response.status} ${response.config.url}`)
    }
    return response
  },
  error => {
    // Handle specific error cases
    if (error.code === 'ECONNABORTED') {
      console.error(
        '[API Timeout] Request timeout - server may be waking up from sleep'
      )

      // Create a more user-friendly error
      const timeoutError = new Error(
        'Request timeout. The server might be starting up. Please try again in a moment.'
      )
      return Promise.reject(timeoutError)
    }

    if (error.response) {
      // Server responded with error status
      console.error(
        `[API Error] ${error.response.status} ${error.response.config?.url}`,
        error.response.data
      )

      // Extract error message from response
      const message =
        error.response.data?.message ||
        error.response.data?.detail ||
        `Server error: ${error.response.status}`

      const apiError = new Error(message)
      return Promise.reject(apiError)
    } else if (error.request) {
      // Request was made but no response
      console.error('[API No Response]', error.request)
      const networkError = new Error(
        'Network error. Please check your internet connection.'
      )
      return Promise.reject(networkError)
    }

    // Something else happened
    console.error('[API Error]', error.message)
    return Promise.reject(error)
  }
)

// Helper function for requests with extended timeout (for Render cold starts)
export const apiWithExtendedTimeout = axios.create({
  ...api.defaults,
  timeout: 60000, // 60 seconds for cold starts
})

// Copy interceptors to extended timeout instance
apiWithExtendedTimeout.interceptors.request = api.interceptors.request
apiWithExtendedTimeout.interceptors.response = api.interceptors.response

// Export base URL for reference
export const getApiBaseUrl = () => API_BASE_URL

// Health check function
export const checkApiHealth = async (): Promise<{
  healthy: boolean
  data?: any
  error?: { message: string }
}> => {
  try {
    const response = await api.get('/health')
    return { healthy: true, data: response.data }
  } catch (error) {
    return {
      healthy: false,
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
      },
    }
  }
}

export default api
