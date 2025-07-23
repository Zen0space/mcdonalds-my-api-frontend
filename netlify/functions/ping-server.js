exports.handler = async (event, context) => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://mcdonalds-malaysia-api.onrender.com";

  console.log(`[Manual Ping] Starting ping to ${API_URL} at ${new Date().toISOString()}`);

  // Allow CORS for testing
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    const startTime = Date.now();

    // Make a simple GET request to the locations endpoint
    const response = await fetch(`${API_URL}/api/v1/locations`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Netlify-Manual-Ping-Function',
      },
      // Set a timeout to prevent hanging
      signal: AbortSignal.timeout(30000), // 30 seconds timeout
    });

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    if (response.ok) {
      console.log(`[Manual Ping] Successfully pinged server. Status: ${response.status}, Response time: ${responseTime}ms`);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: "Server ping successful",
          timestamp: new Date().toISOString(),
          serverStatus: response.status,
          responseTime: `${responseTime}ms`,
          apiUrl: API_URL,
        }),
      };
    } else {
      console.error(`[Manual Ping] Server responded with status: ${response.status}`);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: false,
          message: "Server responded with non-OK status",
          timestamp: new Date().toISOString(),
          serverStatus: response.status,
          responseTime: `${responseTime}ms`,
          apiUrl: API_URL,
        }),
      };
    }
  } catch (error) {
    console.error('[Manual Ping] Error pinging server:', error);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: false,
        message: "Failed to ping server",
        timestamp: new Date().toISOString(),
        error: error.message || "Unknown error",
        apiUrl: API_URL,
      }),
    };
  }
};
