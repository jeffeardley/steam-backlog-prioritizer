// Types for our IPC structure
export interface IPCRoute {
    namespace: string;  // 'timeline', 'statemanagement', etc.
    action: string;     // the part after the '/'
}

// Helper to parse IPC routes
export class IPCRouteParser {
    static parse(channel: string): IPCRoute {
        const [namespace, action] = channel.split('/');
        return { namespace, action };
    }
}