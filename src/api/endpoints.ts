import { config } from '../core/config.ts';
import { HttpMethod, RequestConfig } from '../core/types.ts';

export class EndpointProcessor {
    private static endpoints: RequestConfig[] = [
        // Files
        { method: HttpMethod.GET, path: "/v1/files/:file_key" },
        { method: HttpMethod.GET, path: "/v1/files/:file_key/comments" },
        { method: HttpMethod.GET, path: "/v1/files/:file_key/comments/:comment_id/reactions" },
        { method: HttpMethod.GET, path: "/v1/files/:file_key/images", body: { ids: "0:1" } },
        { method: HttpMethod.GET, path: "/v1/files/:file_key/nodes", body: { ids: "0:1" } },
        { method: HttpMethod.GET, path: "/v1/files/:file_key/versions" },
        { method: HttpMethod.GET, path: "/v1/images/:file_key", body: { ids: "0:1" } },
        
        // POST endpoints with required parameters
        { 
            method: HttpMethod.POST, 
            path: "/v1/files/:file_key/comments",
            body: {
                message: "Test comment",
                client_meta: {
                    node_id: "1:1",
                    node_offset: {
                        x: 0,
                        y: 0
                    }
                }
            }
        },
        { 
            method: HttpMethod.POST, 
            path: "/v1/files/:file_key/comments/:comment_id/reactions",
            body: { 
                reaction_type: "👍"
            }
        },
        { 
            method: HttpMethod.POST, 
            path: "/v1/dev_resources",
            body: { 
                dev_resources: [{
                    name: "Test Resource",
                    url: "https://example.com",
                    file_key: config.fileKeys.CAN_EDIT,
                    node_id: "1:1"
                }]
            }
        },
        { 
            method: HttpMethod.POST, 
            path: "/v2/webhooks",
            body: {
                team_id: ":team_id",
                event_type: "FILE_UPDATE",
                endpoint: "https://example.com/webhook"
            }
        },
        { 
            method: HttpMethod.POST, 
            path: "/v1/files/:file_key/variables",
            body: {
                variables: [{
                    name: "Test Variable",
                    type: "STRING",
                    value: "test"
                }]
            }
        }
    ];

    static getEndpoints(): RequestConfig[] {
        return this.endpoints;
    }

    static getEndpointPaths(): string[] {
        return this.endpoints.map(endpoint => endpoint.path);
    }

    static process(endpoint: string): string {
        const replacements: Record<string, string | undefined> = {
            ':file_key': config.fileKeys?.CAN_VIEW,
            ':file_key_edit': config.fileKeys?.CAN_EDIT,
            ':team_id': config.teamId?.TEAM_ID,
            ':comment_id': config.commentIds?.SAMPLE_COMMENT,
            ':node_id': config.nodeIds?.SAMPLE_NODE,
            ':image_id': config.imageIds?.SAMPLE_IMAGE
        };
        
        return this.replaceTokens(endpoint, replacements);
    }
    
    private static replaceTokens(path: string, replacements: Record<string, string | undefined>): string {
        return Object.entries(replacements).reduce(
            (path, [placeholder, value]) => {
                if (!path.includes(placeholder)) return path;
                const replacement = value || `missing-${placeholder.slice(1)}`;
                return path.replace(placeholder, replacement);
            },
            path
        );
    }

    static getEndpointsByMethod(method: HttpMethod): string[] {
        return this.endpoints
            .filter(endpoint => endpoint.method === method)
            .map(endpoint => endpoint.path);
    }
}