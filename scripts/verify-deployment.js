#!/usr/bin/env node

/**
 * Deployment Verification Script for McDonald's Malaysia Frontend
 *
 * This script verifies that the Netlify deployment is working correctly
 * by testing various aspects of the deployed application.
 */

const https = require('https');
const http = require('http');

const DEPLOYMENT_URL = 'https://mcd-api-frontend.netlify.app';
const API_URL = 'https://mcdonalds-malaysia-api.onrender.com';

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https:') ? https : http;

    const req = protocol.request(url, {
      method: options.method || 'GET',
      headers: options.headers || {},
      timeout: options.timeout || 10000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
          url: url
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(options.body);
    }

    req.end();
  });
}

// Test functions
async function testMainPage() {
  console.log(`${colors.blue}Testing main page...${colors.reset}`);

  try {
    const response = await makeRequest(DEPLOYMENT_URL);

    if (response.statusCode === 200) {
      const hasNextJs = response.body.includes('_next/static');
      const hasTitle = response.body.includes('McDonald');

      if (hasNextJs && hasTitle) {
        console.log(`${colors.green}✅ Main page loads correctly${colors.reset}`);
        return true;
      } else {
        console.log(`${colors.yellow}⚠️  Main page loads but content may be incomplete${colors.reset}`);
        return false;
      }
    } else {
      console.log(`${colors.red}❌ Main page failed: ${response.statusCode}${colors.reset}`);
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}❌ Main page error: ${error.message}${colors.reset}`);
    return false;
  }
}

async function testStaticAssets() {
  console.log(`${colors.blue}Testing static assets...${colors.reset}`);

  // Get the main page to extract asset URLs
  try {
    const mainPage = await makeRequest(DEPLOYMENT_URL);

    // Extract CSS and JS file URLs
    const cssMatches = mainPage.body.match(/_next\/static\/css\/[^"]+\.css/g) || [];
    const jsMatches = mainPage.body.match(/_next\/static\/chunks\/[^"]+\.js/g) || [];

    let passedTests = 0;
    let totalTests = 0;

    // Test CSS files
    for (const cssPath of cssMatches.slice(0, 2)) { // Test first 2 CSS files
      totalTests++;
      try {
        const cssUrl = `${DEPLOYMENT_URL}/${cssPath}`;
        const response = await makeRequest(cssUrl);

        if (response.statusCode === 200 && response.headers['content-type']?.includes('text/css')) {
          passedTests++;
          console.log(`${colors.green}✅ CSS asset: ${cssPath}${colors.reset}`);
        } else {
          console.log(`${colors.red}❌ CSS asset failed: ${cssPath} (${response.statusCode})${colors.reset}`);
        }
      } catch (error) {
        console.log(`${colors.red}❌ CSS asset error: ${cssPath} - ${error.message}${colors.reset}`);
      }
    }

    // Test JS files
    for (const jsPath of jsMatches.slice(0, 3)) { // Test first 3 JS files
      totalTests++;
      try {
        const jsUrl = `${DEPLOYMENT_URL}/${jsPath}`;
        const response = await makeRequest(jsUrl);

        if (response.statusCode === 200 &&
            (response.headers['content-type']?.includes('javascript') ||
             response.headers['content-type']?.includes('application/javascript'))) {
          passedTests++;
          console.log(`${colors.green}✅ JS asset: ${jsPath}${colors.reset}`);
        } else {
          console.log(`${colors.red}❌ JS asset failed: ${jsPath} (${response.statusCode}, ${response.headers['content-type']})${colors.reset}`);
        }
      } catch (error) {
        console.log(`${colors.red}❌ JS asset error: ${jsPath} - ${error.message}${colors.reset}`);
      }
    }

    const success = passedTests === totalTests && totalTests > 0;
    console.log(`${success ? colors.green : colors.red}Static assets: ${passedTests}/${totalTests} passed${colors.reset}`);
    return success;

  } catch (error) {
    console.log(`${colors.red}❌ Could not test static assets: ${error.message}${colors.reset}`);
    return false;
  }
}

async function testApiConnectivity() {
  console.log(`${colors.blue}Testing API connectivity...${colors.reset}`);

  try {
    // Test backend API health
    const healthResponse = await makeRequest(`${API_URL}/health`);

    if (healthResponse.statusCode === 200) {
      console.log(`${colors.green}✅ Backend API is healthy${colors.reset}`);

      // Test outlets endpoint
      try {
        const outletsResponse = await makeRequest(`${API_URL}/api/v1/outlets?limit=1`);

        if (outletsResponse.statusCode === 200) {
          console.log(`${colors.green}✅ Outlets API endpoint working${colors.reset}`);
          return true;
        } else {
          console.log(`${colors.yellow}⚠️  Backend healthy but outlets endpoint returned: ${outletsResponse.statusCode}${colors.reset}`);
          return false;
        }
      } catch (error) {
        console.log(`${colors.yellow}⚠️  Backend healthy but outlets endpoint failed: ${error.message}${colors.reset}`);
        return false;
      }
    } else {
      console.log(`${colors.red}❌ Backend API health check failed: ${healthResponse.statusCode}${colors.reset}`);
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}❌ Backend API unreachable: ${error.message}${colors.reset}`);
    return false;
  }
}

async function testEnvironmentVariables() {
  console.log(`${colors.blue}Testing environment configuration...${colors.reset}`);

  try {
    const response = await makeRequest(DEPLOYMENT_URL);

    // Check if the correct API URL is being used in the frontend
    const hasProductionApiUrl = response.body.includes('mcdonalds-malaysia-api.onrender.com');
    const hasLocalApiUrl = response.body.includes('localhost:8000');

    if (hasProductionApiUrl && !hasLocalApiUrl) {
      console.log(`${colors.green}✅ Production API URL configured correctly${colors.reset}`);
      return true;
    } else if (hasLocalApiUrl) {
      console.log(`${colors.red}❌ Still using localhost API URL in production${colors.reset}`);
      return false;
    } else {
      console.log(`${colors.yellow}⚠️  Could not verify API URL configuration${colors.reset}`);
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}❌ Could not test environment variables: ${error.message}${colors.reset}`);
    return false;
  }
}

async function testHeaders() {
  console.log(`${colors.blue}Testing security headers...${colors.reset}`);

  try {
    const response = await makeRequest(DEPLOYMENT_URL);

    const headers = response.headers;
    let passedChecks = 0;
    let totalChecks = 0;

    // Check security headers
    const securityHeaders = {
      'x-frame-options': 'DENY',
      'x-content-type-options': 'nosniff',
      'x-xss-protection': '1; mode=block'
    };

    for (const [header, expectedValue] of Object.entries(securityHeaders)) {
      totalChecks++;
      if (headers[header] && headers[header].toLowerCase().includes(expectedValue.toLowerCase())) {
        passedChecks++;
        console.log(`${colors.green}✅ ${header}: ${headers[header]}${colors.reset}`);
      } else {
        console.log(`${colors.yellow}⚠️  Missing or incorrect ${header}: ${headers[header] || 'not set'}${colors.reset}`);
      }
    }

    console.log(`${passedChecks === totalChecks ? colors.green : colors.yellow}Security headers: ${passedChecks}/${totalChecks} passed${colors.reset}`);
    return passedChecks >= totalChecks / 2; // Pass if at least half the headers are correct

  } catch (error) {
    console.log(`${colors.red}❌ Could not test headers: ${error.message}${colors.reset}`);
    return false;
  }
}

// Main verification function
async function verifyDeployment() {
  console.log(`${colors.bold}${colors.blue}🔍 McDonald's Malaysia Frontend - Deployment Verification${colors.reset}`);
  console.log(`${colors.blue}Deployment URL: ${DEPLOYMENT_URL}${colors.reset}`);
  console.log(`${colors.blue}Backend API: ${API_URL}${colors.reset}\n`);

  const tests = [
    { name: 'Main Page', fn: testMainPage },
    { name: 'Static Assets', fn: testStaticAssets },
    { name: 'API Connectivity', fn: testApiConnectivity },
    { name: 'Environment Config', fn: testEnvironmentVariables },
    { name: 'Security Headers', fn: testHeaders }
  ];

  let passedTests = 0;
  const results = [];

  for (const test of tests) {
    console.log(''); // Add spacing
    try {
      const result = await test.fn();
      results.push({ name: test.name, passed: result });
      if (result) passedTests++;
    } catch (error) {
      console.log(`${colors.red}❌ ${test.name} failed with error: ${error.message}${colors.reset}`);
      results.push({ name: test.name, passed: false });
    }
  }

  // Summary
  console.log(`\n${colors.bold}📊 DEPLOYMENT VERIFICATION SUMMARY${colors.reset}`);
  console.log('='.repeat(50));

  results.forEach(result => {
    const status = result.passed ? `${colors.green}✅ PASS` : `${colors.red}❌ FAIL`;
    console.log(`${status} ${result.name}${colors.reset}`);
  });

  console.log('='.repeat(50));
  const overallStatus = passedTests === tests.length ? 'SUCCESS' : passedTests >= tests.length / 2 ? 'PARTIAL' : 'FAILED';
  const statusColor = overallStatus === 'SUCCESS' ? colors.green : overallStatus === 'PARTIAL' ? colors.yellow : colors.red;

  console.log(`${colors.bold}Overall Status: ${statusColor}${overallStatus} (${passedTests}/${tests.length} tests passed)${colors.reset}`);

  if (overallStatus === 'SUCCESS') {
    console.log(`\n${colors.green}🎉 Deployment is working correctly!${colors.reset}`);
    console.log(`${colors.green}🌐 Your app is live at: ${DEPLOYMENT_URL}${colors.reset}`);
  } else if (overallStatus === 'PARTIAL') {
    console.log(`\n${colors.yellow}⚠️  Deployment is partially working. Some issues need attention.${colors.reset}`);
  } else {
    console.log(`\n${colors.red}💥 Deployment has significant issues that need to be resolved.${colors.reset}`);
  }

  console.log(`\n${colors.blue}💡 To run this verification again: node scripts/verify-deployment.js${colors.reset}`);

  // Exit with appropriate code
  process.exit(overallStatus === 'FAILED' ? 1 : 0);
}

// Run verification if called directly
if (require.main === module) {
  verifyDeployment().catch(error => {
    console.error(`${colors.red}❌ Verification script failed: ${error.message}${colors.reset}`);
    process.exit(1);
  });
}

module.exports = {
  verifyDeployment,
  testMainPage,
  testStaticAssets,
  testApiConnectivity,
  testEnvironmentVariables,
  testHeaders
};
