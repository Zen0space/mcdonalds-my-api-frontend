/**
 * API Connection Test Utility
 *
 * This utility helps test and debug the connection to the McDonald's Malaysia backend API.
 * It can be used during development to ensure the API is properly connected and responsive.
 */

import { api, apiWithExtendedTimeout, getApiBaseUrl } from '@/services/api';
import { chatService } from '@/services/chat';
import { outletService } from '@/services/outlets';

export interface ConnectionTestResult {
  endpoint: string;
  success: boolean;
  statusCode?: number;
  latency: number;
  error?: string;
  data?: any;
}

export interface FullConnectionTestResult {
  apiUrl: string;
  timestamp: Date;
  environment: string;
  tests: ConnectionTestResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    averageLatency: number;
    isColdStart: boolean;
  };
}

/**
 * Test a single endpoint
 */
async function testEndpoint(
  endpoint: string,
  method: 'GET' | 'POST' = 'GET',
  data?: any,
  useExtendedTimeout: boolean = false
): Promise<ConnectionTestResult> {
  const startTime = Date.now();
  const client = useExtendedTimeout ? apiWithExtendedTimeout : api;

  try {
    const response = await client.request({
      method,
      url: endpoint,
      data,
    });

    return {
      endpoint,
      success: true,
      statusCode: response.status,
      latency: Date.now() - startTime,
      data: response.data,
    };
  } catch (error: any) {
    return {
      endpoint,
      success: false,
      statusCode: error.response?.status,
      latency: Date.now() - startTime,
      error: error.message || 'Unknown error',
    };
  }
}

/**
 * Run a comprehensive connection test
 */
export async function runFullConnectionTest(): Promise<FullConnectionTestResult> {
  const apiUrl = getApiBaseUrl();
  const timestamp = new Date();
  const environment = process.env.NODE_ENV || 'development';

  console.log('🔍 Starting API connection test...');
  console.log(`📡 API URL: ${apiUrl}`);
  console.log(`🌍 Environment: ${environment}`);
  console.log('');

  const tests: ConnectionTestResult[] = [];

  // Test 1: Basic health check (with extended timeout for cold start)
  console.log('1️⃣ Testing health endpoint (may take 30+ seconds on first request)...');
  const healthTest = await testEndpoint('/health', 'GET', undefined, true);
  tests.push(healthTest);
  console.log(healthTest.success ? '✅ Health check passed' : '❌ Health check failed');

  // Detect if this was a cold start
  const isColdStart = healthTest.latency > 10000;
  if (isColdStart) {
    console.log('⏳ Cold start detected (server was sleeping). Subsequent requests will be faster.');
  }

  // Test 2: API v1 health check
  console.log('\n2️⃣ Testing API v1 health...');
  const apiV1Health = await testEndpoint('/api/v1/health', 'GET');
  tests.push(apiV1Health);
  console.log(apiV1Health.success ? '✅ API v1 health passed' : '❌ API v1 health failed');

  // Test 3: Chat service health
  console.log('\n3️⃣ Testing chat service health...');
  const chatHealth = await testEndpoint('/api/v1/chat/health', 'GET');
  tests.push(chatHealth);
  console.log(chatHealth.success ? '✅ Chat service healthy' : '❌ Chat service unhealthy');

  // Test 4: Outlets endpoint
  console.log('\n4️⃣ Testing outlets endpoint...');
  const outletsTest = await testEndpoint('/outlets', 'GET');
  tests.push(outletsTest);
  console.log(outletsTest.success ? `✅ Outlets endpoint working (${outletsTest.data?.length || 0} outlets)` : '❌ Outlets endpoint failed');

  // Test 5: Create chat session (POST request)
  console.log('\n5️⃣ Testing chat session creation...');
  const sessionTest = await testEndpoint('/api/v1/chat/session', 'POST', {});
  tests.push(sessionTest);
  console.log(sessionTest.success ? '✅ Chat session creation working' : '❌ Chat session creation failed');

  // Calculate summary
  const passedTests = tests.filter(t => t.success).length;
  const totalLatency = tests.reduce((sum, t) => sum + t.latency, 0);

  const summary = {
    total: tests.length,
    passed: passedTests,
    failed: tests.length - passedTests,
    averageLatency: Math.round(totalLatency / tests.length),
    isColdStart,
  };

  // Print summary
  console.log('\n📊 Test Summary:');
  console.log(`✅ Passed: ${summary.passed}/${summary.total}`);
  console.log(`❌ Failed: ${summary.failed}/${summary.total}`);
  console.log(`⏱️  Average latency: ${summary.averageLatency}ms`);
  console.log(`🔌 Connection status: ${summary.passed === summary.total ? 'HEALTHY' : summary.passed > 0 ? 'PARTIAL' : 'OFFLINE'}`);

  return {
    apiUrl,
    timestamp,
    environment,
    tests,
    summary,
  };
}

/**
 * Quick connection check
 */
export async function quickConnectionCheck(): Promise<boolean> {
  try {
    const response = await apiWithExtendedTimeout.get('/health');
    return response.status === 200;
  } catch {
    return false;
  }
}

/**
 * Test specific service
 */
export async function testService(service: 'chat' | 'outlets'): Promise<{
  service: string;
  working: boolean;
  latency: number;
  details?: any;
  error?: string;
}> {
  const startTime = Date.now();

  try {
    let result: any;

    switch (service) {
      case 'chat':
        result = await chatService.healthCheck();
        break;
      case 'outlets':
        result = await outletService.getOutlets();
        break;
      default:
        throw new Error(`Unknown service: ${service}`);
    }

    return {
      service,
      working: true,
      latency: Date.now() - startTime,
      details: result,
    };
  } catch (error: any) {
    return {
      service,
      working: false,
      latency: Date.now() - startTime,
      error: error.message || 'Service test failed',
    };
  }
}

/**
 * Measure API latency over multiple requests
 */
export async function measureApiLatency(numRequests: number = 5): Promise<{
  measurements: number[];
  min: number;
  max: number;
  average: number;
  median: number;
}> {
  const measurements: number[] = [];

  for (let i = 0; i < numRequests; i++) {
    const start = Date.now();
    try {
      await api.get('/health');
      measurements.push(Date.now() - start);
    } catch {
      // Still record the time even if request fails
      measurements.push(Date.now() - start);
    }

    // Small delay between requests
    if (i < numRequests - 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  // Calculate statistics
  const sorted = [...measurements].sort((a, b) => a - b);
  const sum = measurements.reduce((a, b) => a + b, 0);

  return {
    measurements,
    min: Math.min(...measurements),
    max: Math.max(...measurements),
    average: Math.round(sum / measurements.length),
    median: sorted[Math.floor(sorted.length / 2)],
  };
}

/**
 * Format test results as a readable string
 */
export function formatTestResults(results: FullConnectionTestResult): string {
  let output = `API Connection Test Results\n`;
  output += `==========================\n\n`;
  output += `API URL: ${results.apiUrl}\n`;
  output += `Environment: ${results.environment}\n`;
  output += `Timestamp: ${results.timestamp.toISOString()}\n`;
  output += `\nTest Results:\n`;
  output += `-------------\n`;

  results.tests.forEach((test, index) => {
    const status = test.success ? '✅' : '❌';
    output += `${index + 1}. ${status} ${test.endpoint}\n`;
    output += `   Status: ${test.statusCode || 'N/A'} | Latency: ${test.latency}ms\n`;
    if (test.error) {
      output += `   Error: ${test.error}\n`;
    }
    output += '\n';
  });

  output += `Summary:\n`;
  output += `--------\n`;
  output += `Total Tests: ${results.summary.total}\n`;
  output += `Passed: ${results.summary.passed}\n`;
  output += `Failed: ${results.summary.failed}\n`;
  output += `Average Latency: ${results.summary.averageLatency}ms\n`;
  output += `Cold Start: ${results.summary.isColdStart ? 'Yes' : 'No'}\n`;

  return output;
}

/**
 * Browser console utilities
 */
if (typeof window !== 'undefined') {
  (window as any).testConnection = {
    quick: quickConnectionCheck,
    full: runFullConnectionTest,
    service: testService,
    latency: measureApiLatency,
    help: () => {
      console.log(`
🛠️  API Connection Test Utilities
================================

Available commands:

testConnection.quick()
  Quick health check of the API

testConnection.full()
  Run comprehensive connection tests

testConnection.service('chat' | 'outlets')
  Test a specific service

testConnection.latency(numRequests?)
  Measure API latency over multiple requests

testConnection.help()
  Show this help message

Example usage:
  await testConnection.quick()
  await testConnection.full()
  await testConnection.service('chat')
  await testConnection.latency(10)
      `);
    },
  };

  console.log('💡 API connection test utilities loaded. Type `testConnection.help()` for usage.');
}

export default {
  runFullConnectionTest,
  quickConnectionCheck,
  testService,
  measureApiLatency,
  formatTestResults,
};
