import "@std/dotenv/load";
import { ApiConfig } from "./types.ts";

// Environment validation
function validateEnvVar(name: string, required: boolean = true): string {
    const value = Deno.env.get(name);
    if (required && !value) {
        throw new Error(`${name} is not defined in environment variables`);
    }
    return value || '';
}

export const config: ApiConfig = {
    baseURL: "https://api.figma.com",
    userTokens: {
        ADMIN_USER: validateEnvVar("FIGMA_ADMIN_TOKEN"),
        DESIGN_USER: validateEnvVar("FIGMA_DESIGN_TOKEN"),
        DEVMODE_USER: validateEnvVar("FIGMA_DEVMODE_TOKEN"),
        FREE_USER: validateEnvVar("FIGMA_FREE_TOKEN"),
    },
    teamId: {
        TEAM_ID: validateEnvVar("FIGMA_TEAM_ID")
    },
    fileKeys: {
        CAN_VIEW: validateEnvVar("FIGMA_FILE_VIEW_KEY"),
        CAN_EDIT: validateEnvVar("FIGMA_FILE_EDIT_KEY"),
    },
    commentIds: {
        SAMPLE_COMMENT: validateEnvVar("FIGMA_COMMENT_ID", false),
    },
    nodeIds: {
        SAMPLE_NODE: validateEnvVar("FIGMA_NODE_ID", false),
    },
    imageIds: {
        SAMPLE_IMAGE: validateEnvVar("FIGMA_IMAGE_ID", false),
    }
};

export const userSymbols: Record<string, string> = {
    'ADMIN_USER': '⚙️',
    'DESIGN_USER': '🔷',
    'DEVMODE_USER': '⚫️',
    'FREE_USER': '🔺',
}; 