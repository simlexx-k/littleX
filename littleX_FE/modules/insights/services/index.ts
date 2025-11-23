import { private_api } from "@/_core/api-client";

export interface TrendingTopic {
    topic: string;
    mentions: number;
    score: number;
    sample: string;
}

export interface SuggestedCommunity {
    community: string;
    topic: string;
    members: number;
    engagement: number;
}

export interface ThreadInsight {
    thread: string;
    participants: string[];
    engagement: number;
    last_activity: string;
    summary: string;
}

const normalizeReports = (response: any) => {
    return response?.data?.reports?.[0] || [];
};

export const InsightsService = {
    fetchTrendingTopics: async (
        minMentions: number = 2
    ): Promise<TrendingTopic[]> => {
        const response = await private_api.post("/walker/detect_trending_topics", {
            min_mentions: minMentions,
        });
        return normalizeReports(response);
    },

    discoverCommunities: async (
        minMembers: number = 2
    ): Promise<SuggestedCommunity[]> => {
        const response = await private_api.post("/walker/discover_communities", {
            min_members: minMembers,
        });
        return normalizeReports(response);
    },

    fetchThreadInsights: async (threadId?: string): Promise<ThreadInsight[]> => {
        const response = await private_api.post("/walker/thread_insights", {
            thread_id: threadId || "",
        });
        return normalizeReports(response);
    },
};
