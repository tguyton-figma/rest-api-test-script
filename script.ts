import "https://deno.land/std@0.199.0/dotenv/load.ts";
import { ReportGenerator } from "./src/report-generator.ts";

function validateEnvVar(name: string): string {
    const value = Deno.env.get(name);
    if (!value) {
        throw new Error(`${name} is not defined in environment variables`);
    }
    return value;
}

// Define user tokens
export const userTokens = {
    ADMIN_USER: validateEnvVar("FIGMA_ADMIN_TOKEN"),
    DESIGN_USER: validateEnvVar("FIGMA_DESIGN_TOKEN"),
    DEVMODE_USER: validateEnvVar("FIGMA_DEVMODE_TOKEN"),
    FREE_USER: validateEnvVar("FIGMA_FREE_TOKEN"),
};

export const teamId = {
    TEAM_ID: validateEnvVar("FIGMA_TEAM_ID")
};

export const fileKeys = {
    CAN_VIEW: validateEnvVar("FIGMA_FILE_VIEW_KEY"),
    CAN_EDIT: validateEnvVar("FIGMA_FILE_EDIT_KEY"),
};

// Define base url
export const baseURL = "https://api.figma.com";
  
// Define endpoints
export const endpoints = {
    GET: [
      "/v1/files/:file_key",
      "/v1/files/:file_key/comments",
      "/v1/files/:file_key/comments/:comment_id/reactions",
      "/v1/files/:file_key/images",
      "/v1/files/:file_key/nodes",
      "/v1/files/:file_key/versions",
      "/v1/images/:file_key",
      "/v1/me",
    //  "/v1/payments",
    //  "/v1/projects/:project_id/files",
    //  "/v1/components/:key",
    //  "/v1/component_sets/:key",
      "/v1/files/:file_key/components",
      "/v1/files/:file_key/component_sets",
      "/v1/files/:file_key/dev_resources",
      "/v1/files/:file_key/styles",
    //  "/v1/styles/:key",
      "/v1/teams/:team_id/components",
      "/v1/teams/:team_id/component_sets",
      "/v1/teams/:team_id/projects",
      "/v1/teams/:team_id/styles",
      "/v2/teams/:team_id/webhooks",
    //  "/v2/webhooks/:webhook_id",
    //  "/v2/webhooks/:webhook_id/requests",
      "/v1/activity_logs",
    //  "/v1/analytics/libraries/:library_file_key/actions",
    //  "/v1/analytics/libraries/:library_file_key/usages",
      "/v1/files/:file_key/variables/local",
      "/v1/files/:file_key/variables/published"
    ],
    POST: [
    //  "/v1/files/:file_key/comments",
    //  "/v1/files/:file_key/comments/:comment_id/reactions",
    //  "/v1/dev_resources",
    //  "/v2/webhooks",
    //  "/v1/files/:file_key/variables"
    ],
    PUT: [
    // "/v1/dev_resources",
    //  "/v2/webhooks/:webhook_id"
    ],
    DELETE: [
    //  "/v1/files/:file_key/comments/:comment_id",
    //  "/v1/files/:file_key/comments/:comment_id/reactions",
    //  "/v1/files/:file_key/dev_resources/:dev_resource_id",
    //  "/v2/webhooks/:webhook_id"
    ]
  };
  

// Functions to send requests

// Function to handle GET requests
export async function getRequest<T>(url: string, token: string): Promise<T> {
    const headers = new Headers({ "X-FIGMA-TOKEN": token }); // Use X-FIGMA-TOKEN header
    console.log("Sending GET request to:", url);
    console.log("Using token:", token);
  
    try {
      const response = await fetch(url, { method: "GET", headers });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! Status: ${response.status} - ${errorText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error("Error during fetch:", error);
      throw error;
    }
  }
  


  // Function to test GET requests
  async function testGetRequests() {
    testResults.length = 0;
    
    for (const [userType, token] of Object.entries(userTokens)) {
        for (const endpoint of endpoints.GET) {
            const url = `${baseURL}${endpoint}`
                .replace(':file_key', fileKeys.CAN_VIEW)
                .replace(':team_id', teamId.TEAM_ID)
                .replace(':comment_id', 'someCommentId');

            try {
                await getRequest(url, token);
                const result = {
                    request: {
                        method: 'GET',
                        endpoint,
                        user: `${userSymbols[userType] || '👤'} ${userType}`,
                        status: '✅ SUCCESS'
                    }
                };
                testResults.push(result);
            } catch (error) {
                const result = {
                    request: {
                        method: 'GET',
                        endpoint,
                        user: `${userSymbols[userType] || '👤'} ${userType}`,
                        status: '❌ FAILED',
                        error: {
                            status: error instanceof Error && 'status' in error ? (error as { status: number }).status : 500,
                            message: error instanceof Error ? error.message : String(error)
                        }
                    }
                };
                testResults.push(result);
            }
        }
    }

    const allEndpoints = endpoints.GET;
    const allUserTypes = Object.keys(userTokens);
    
    try {
        await ReportGenerator.generateReports(testResults, allEndpoints, allUserTypes);
    } catch (error) {
        console.error("Failed to generate reports:", error);
        throw error;
    }
  }


  // Function to handle POST requests (example)
 export async function postRequest(url: string, token: string, body: string) {
    const headers = new Headers({
      "X-FIGMA-TOKEN": token,
      "Content-Type": "application/json",
    });
    const response = await fetch(url, { method: "POST", headers, body: JSON.stringify(body) });
    return response;
  }



/*
  // Main function to iterate over all combinations
  async function main() {
    const results = [];
  
    for (const [user, token] of Object.entries(userTokens)) {
      for (const [fileType, fileKey] of Object.entries(fileKeys)) {
        for (const endpoint of endpoints.GET) {
          const url = `https://api.figma.com${endpoint.replace(":file_key", fileKey)}`;
          const response = await getRequest(url, token);
          results.push({ user, fileType, endpoint, status: response.status, body: await response.text() });
        }
  
        for (const endpoint of endpoints.POST) {
          const url = `https://api.figma.com${endpoint.replace(":file_key", fileKey)}`;
          const body = { add request body as needed };
          const response = await postRequest(url, token, body);
          results.push({ user, fileType, endpoint, status: response.status, body: await response.text() });
        }
      }
    }
  
    // Log results
    results.forEach(result => {
      console.log(`User: ${result.user}, File: ${result.fileType}, Endpoint: ${result.endpoint}, Status: ${result.status}`);
      console.log(`Response: ${result.body}\n`);
    });
  }


  
  // Execute the script
  */

// Update the logResult function to collect results instead of logging
const testResults: TestResult[] = [];

interface TestResult {
  request: {
    method: string;
    endpoint: string;
    user: string;
    status: string;
    error?: {
      status?: number;
      message: string;
    };
  };
}

// Add user symbols mapping
const userSymbols: Record<string, string> = {
  'ADMIN_USER': '⚙️ ',
  'DESIGN_USER': '🔷',
  'DEVMODE_USER': '⚫️',
  'FREE_USER': '🔺',
};

// Main function to handle execution
async function main() {
  try {
    await testGetRequests();
  } catch (error) {
    console.error('Error running tests:', error);
    Deno.exit(1);
  }
}

// Execute the main function
main().catch((error) => {
  console.error('Unhandled error:', error);
  Deno.exit(1);
});