const { schedule } = require("@netlify/functions");

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://mcdonalds-malaysia-api.onrender.com";

const handler = async (event, context) => {
  console.log(`[Keep-Alive] Starting ping to ${API_URL} at ${new Date().toISOString()}`);

  try {
    // Make a simple GET request to the root endpoint or health check endpoint
    const response = await fetch(`${API_URL}/api/v1/locations`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Netlify-Keep-Alive-Function',
      },
      // Set a timeout to prevent hanging
      signal: AbortSignal.timeout(30000), // 30 seconds timeout
    });

    if (response.ok) {
      console.log(`[Keep-Alive] Successfully pinged server. Status: ${response.status}`);
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Keep-alive ping successful",
          timestamp: new Date().toISOString(),
          status: response.status,
        }),
      };
    } else {
      console.error(`[Keep-Alive] Server responded with status: ${response.status}`);
      return {
        statusCode: 200, // Still return 200 to prevent Netlify from retrying
        body: JSON.stringify({
          message: "Keep-alive ping completed with non-OK status",
          timestamp: new Date().toISOString(),
          serverStatus: response.status,
        }),
      };
    }
  } catch (error) {
    console.error('[Keep-Alive] Error pinging server:', error);

    // Return 200 to prevent Netlify from retrying
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Keep-alive ping failed",
        timestamp: new Date().toISOString(),
        error: error.message || "Unknown error",
      }),
    };
  }
};

// Schedule the function to run every 14 minutes
module.exports.handler = schedule("*/14 * * * *", handler);
