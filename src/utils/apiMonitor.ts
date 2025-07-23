import { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// Types for monitoring data
export interface ApiMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  slowestEndpoint: { url: string; time: number } | null;
  fastestEndpoint: { url: string; time: number } | null;
  errorsByEndpoint: Record<string, number>;
  requestsByEndpoint: Record<string, number>;
}

export interface RequestTiming {
  url: string;
  method: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  status?: number;
  error?: string;
}

// Storage for metrics
class ApiMetricsStore {
  private metrics: ApiMetrics = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0,
    slowestEndpoint: null,
    fastestEndpoint: null,
    errorsByEndpoint: {},
    requestsByEndpoint: {},
  };

  private timings: RequestTiming[] = [];
  private responseTimes: number[] = [];

  addRequest(timing: RequestTiming) {
    this.metrics.totalRequests++;
    const endpoint = `${timing.method} ${timing.url}`;

    // Track requests by endpoint
    this.metrics.requestsByEndpoint[endpoint] =
      (this.metrics.requestsByEndpoint[endpoint] || 0) + 1;

    if (timing.duration) {
      this.responseTimes.push(timing.duration);
      this.updateAverageResponseTime();
      this.updateSlowestFastest(timing);
    }

    if (timing.error) {
      this.metrics.failedRequests++;
      this.metrics.errorsByEndpoint[endpoint] =
        (this.metrics.errorsByEndpoint[endpoint] || 0) + 1;
    } else if (timing.status && timing.status < 400) {
      this.metrics.successfulRequests++;
    }

    // Keep only last 100 timings in memory
    this.timings.push(timing);
    if (this.timings.length > 100) {
      this.timings.shift();
    }
  }

  private updateAverageResponseTime() {
    if (this.responseTimes.length === 0) return;

    const sum = this.responseTimes.reduce((a, b) => a + b, 0);
    this.metrics.averageResponseTime = Math.round(sum / this.responseTimes.length);
  }

  private updateSlowestFastest(timing: RequestTiming) {
    if (!timing.duration) return;

    const endpoint = `${timing.method} ${timing.url}`;

    if (!this.metrics.slowestEndpoint || timing.duration > this.metrics.slowestEndpoint.time) {
      this.metrics.slowestEndpoint = { url: endpoint, time: timing.duration };
    }

    if (!this.metrics.fastestEndpoint || timing.duration < this.metrics.fastestEndpoint.time) {
      this.metrics.fastestEndpoint = { url: endpoint, time: timing.duration };
    }
  }

  getMetrics(): ApiMetrics {
    return { ...this.metrics };
  }

  getRecentTimings(): RequestTiming[] {
    return [...this.timings];
  }

  reset() {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      slowestEndpoint: null,
      fastestEndpoint: null,
      errorsByEndpoint: {},
      requestsByEndpoint: {},
    };
    this.timings = [];
    this.responseTimes = [];
  }
}

// Global metrics store
const metricsStore = new ApiMetricsStore();

// API Monitor class
export class ApiMonitor {
  private static instance: ApiMonitor;
  private enabled: boolean = process.env.NODE_ENV === 'development';
  private logToConsole: boolean = true;

  private constructor() {}

  static getInstance(): ApiMonitor {
    if (!ApiMonitor.instance) {
      ApiMonitor.instance = new ApiMonitor();
    }
    return ApiMonitor.instance;
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  setLogToConsole(log: boolean) {
    this.logToConsole = log;
  }

  // Request interceptor
  logRequest(config: AxiosRequestConfig): AxiosRequestConfig {
    if (!this.enabled) return config;

    const timing: RequestTiming = {
      url: config.url || '',
      method: config.method?.toUpperCase() || 'GET',
      startTime: Date.now(),
    };

    // Attach timing to config for response interceptor
    (config as any).__timing = timing;

    if (this.logToConsole) {
      console.log(
        `🔄 [API Request] ${timing.method} ${timing.url}`,
        {
          params: config.params,
          data: config.data,
        }
      );
    }

    return config;
  }

  // Response interceptor
  logResponse(response: AxiosResponse): AxiosResponse {
    if (!this.enabled) return response;

    const timing = (response.config as any).__timing as RequestTiming;
    if (timing) {
      timing.endTime = Date.now();
      timing.duration = timing.endTime - timing.startTime;
      timing.status = response.status;

      metricsStore.addRequest(timing);

      if (this.logToConsole) {
        const emoji = response.status < 300 ? '✅' : '⚠️';
        console.log(
          `${emoji} [API Response] ${response.status} ${timing.method} ${timing.url} (${timing.duration}ms)`,
          {
            data: response.data,
            headers: response.headers,
          }
        );
      }
    }

    return response;
  }

  // Error interceptor
  logError(error: AxiosError): Promise<AxiosError> {
    if (!this.enabled) return Promise.reject(error);

    const timing = (error.config as any)?.__timing as RequestTiming;
    if (timing) {
      timing.endTime = Date.now();
      timing.duration = timing.endTime - timing.startTime;
      timing.status = error.response?.status;
      timing.error = error.message;

      metricsStore.addRequest(timing);

      if (this.logToConsole) {
        console.error(
          `❌ [API Error] ${timing.method} ${timing.url} (${timing.duration}ms)`,
          {
            status: error.response?.status,
            message: error.message,
            data: error.response?.data,
          }
        );
      }
    }

    return Promise.reject(error);
  }

  // Get current metrics
  getMetrics(): ApiMetrics {
    return metricsStore.getMetrics();
  }

  // Get recent request timings
  getRecentRequests(): RequestTiming[] {
    return metricsStore.getRecentTimings();
  }

  // Reset metrics
  resetMetrics() {
    metricsStore.reset();
  }

  // Print metrics summary to console
  printMetricsSummary() {
    const metrics = this.getMetrics();
    console.log('📊 API Metrics Summary:', {
      totalRequests: metrics.totalRequests,
      successRate: metrics.totalRequests > 0
        ? `${((metrics.successfulRequests / metrics.totalRequests) * 100).toFixed(2)}%`
        : 'N/A',
      averageResponseTime: `${metrics.averageResponseTime}ms`,
      slowestEndpoint: metrics.slowestEndpoint
        ? `${metrics.slowestEndpoint.url} (${metrics.slowestEndpoint.time}ms)`
        : 'N/A',
      fastestEndpoint: metrics.fastestEndpoint
        ? `${metrics.fastestEndpoint.url} (${metrics.fastestEndpoint.time}ms)`
        : 'N/A',
      topErrors: Object.entries(metrics.errorsByEndpoint)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([endpoint, count]) => `${endpoint}: ${count} errors`),
    });
  }
}

// Export singleton instance
export const apiMonitor = ApiMonitor.getInstance();

// Utility functions for testing
export const testUtils = {
  /**
   * Test API connection
   */
  async testConnection(apiUrl: string): Promise<{ success: boolean; latency?: number; error?: string }> {
    const startTime = Date.now();

    try {
      const response = await fetch(`${apiUrl}/health`);
      const latency = Date.now() - startTime;

      if (response.ok) {
        return { success: true, latency };
      } else {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
          latency
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  /**
   * Measure endpoint latency
   */
  async measureLatency(apiUrl: string, numTests: number = 5): Promise<{
    min: number;
    max: number;
    average: number;
    tests: number[];
  }> {
    const results: number[] = [];

    for (let i = 0; i < numTests; i++) {
      const startTime = Date.now();
      try {
        await fetch(`${apiUrl}/health`);
        results.push(Date.now() - startTime);
      } catch (error) {
        console.error(`Latency test ${i + 1} failed:`, error);
      }

      // Wait a bit between tests
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    if (results.length === 0) {
      throw new Error('All latency tests failed');
    }

    return {
      min: Math.min(...results),
      max: Math.max(...results),
      average: Math.round(results.reduce((a, b) => a + b) / results.length),
      tests: results,
    };
  },

  /**
   * Check if API is using HTTPS
   */
  isSecureConnection(apiUrl: string): boolean {
    return apiUrl.startsWith('https://');
  },

  /**
   * Format bytes to human readable format
   */
  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },
};

// Export for browser console usage
if (typeof window !== 'undefined') {
  (window as any).apiMonitor = apiMonitor;
  (window as any).apiTestUtils = testUtils;
}
