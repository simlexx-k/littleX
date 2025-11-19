import { private_api } from "@/_core/api-client";

export type ToneType = 'casual' | 'professional' | 'friendly' | 'humorous';

export interface AISuggestion {
    text: string;
    confidence: number;
}

export interface HashtagSuggestion {
    tag: string;
    relevance: number;
}

export interface ContentImprovement {
    original: string;
    improved: string;
    changes: string[];
}

export const AIService = {
    /**
     * Get AI-powered content suggestions based on context
     */
    suggestContent: async (context: string, tone?: ToneType): Promise<AISuggestion[]> => {
        try {
            const response = await private_api.post('/walker/ai_suggest_content', {
                context,
                tone: tone || 'casual',
                num_suggestions: 3
            });
            return response.data?.reports?.[0] || [];
        } catch (error) {
            console.error('Error getting AI suggestions:', error);
            return [];
        }
    },

    /**
     * Generate relevant hashtags for content
     */
    generateHashtags: async (content: string): Promise<HashtagSuggestion[]> => {
        try {
            const response = await private_api.post('/walker/ai_generate_hashtags', {
                content,
                num_hashtags: 5
            });
            return response.data?.reports?.[0] || [];
        } catch (error) {
            console.error('Error generating hashtags:', error);
            return [];
        }
    },

    /**
     * Improve text with AI suggestions
     */
    improveText: async (text: string, style: ToneType): Promise<ContentImprovement | null> => {
        try {
            const response = await private_api.post('/walker/ai_improve_text', {
                text,
                style
            });
            return response.data?.reports?.[0] || null;
        } catch (error) {
            console.error('Error improving text:', error);
            return null;
        }
    },

    /**
     * Get auto-complete suggestions as user types
     */
    getAutoComplete: async (partial: string): Promise<string[]> => {
        try {
            if (partial.length < 3) return [];

            const response = await private_api.post('/walker/ai_autocomplete', {
                partial,
                num_suggestions: 3
            });
            return response.data?.reports?.[0] || [];
        } catch (error) {
            console.error('Error getting autocomplete:', error);
            return [];
        }
    }
};
