import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { ToneType, AISuggestion, HashtagSuggestion } from '../services/ai-service';

export interface AIState {
    // Content suggestions
    suggestions: AISuggestion[];
    isGeneratingSuggestions: boolean;

    // Hashtags
    hashtags: HashtagSuggestion[];
    isGeneratingHashtags: boolean;

    // Writing assistant settings
    selectedTone: ToneType;
    autoCompleteEnabled: boolean;
    aiAssistantEnabled: boolean;

    // UI state
    showSuggestionPanel: boolean;
    activeFeature: 'suggestions' | 'hashtags' | 'improve' | null;

    // Error handling
    error: string | null;
}

const initialState: AIState = {
    suggestions: [],
    isGeneratingSuggestions: false,
    hashtags: [],
    isGeneratingHashtags: false,
    selectedTone: 'casual',
    autoCompleteEnabled: true,
    aiAssistantEnabled: true,
    showSuggestionPanel: false,
    activeFeature: null,
    error: null,
};

const aiSlice = createSlice({
    name: 'ai',
    initialState,
    reducers: {
        // Suggestions
        setSuggestions: (state, action: PayloadAction<AISuggestion[]>) => {
            state.suggestions = action.payload;
            state.isGeneratingSuggestions = false;
            state.error = null;
        },
        setGeneratingSuggestions: (state, action: PayloadAction<boolean>) => {
            state.isGeneratingSuggestions = action.payload;
        },
        clearSuggestions: (state) => {
            state.suggestions = [];
            state.isGeneratingSuggestions = false;
        },

        // Hashtags
        setHashtags: (state, action: PayloadAction<HashtagSuggestion[]>) => {
            state.hashtags = action.payload;
            state.isGeneratingHashtags = false;
            state.error = null;
        },
        setGeneratingHashtags: (state, action: PayloadAction<boolean>) => {
            state.isGeneratingHashtags = false;
        },
        clearHashtags: (state) => {
            state.hashtags = [];
            state.isGeneratingHashtags = false;
        },

        // Settings
        setSelectedTone: (state, action: PayloadAction<ToneType>) => {
            state.selectedTone = action.payload;
        },
        toggleAutoComplete: (state) => {
            state.autoCompleteEnabled = !state.autoCompleteEnabled;
        },
        toggleAIAssistant: (state) => {
            state.aiAssistantEnabled = !state.aiAssistantEnabled;
            if (!state.aiAssistantEnabled) {
                // Clear all AI data when disabled
                state.suggestions = [];
                state.hashtags = [];
                state.showSuggestionPanel = false;
            }
        },

        // UI State
        setShowSuggestionPanel: (state, action: PayloadAction<boolean>) => {
            state.showSuggestionPanel = action.payload;
        },
        setActiveFeature: (state, action: PayloadAction<'suggestions' | 'hashtags' | 'improve' | null>) => {
            state.activeFeature = action.payload;
        },

        // Error handling
        setError: (state, action: PayloadAction<string>) => {
            state.error = action.payload;
            state.isGeneratingSuggestions = false;
            state.isGeneratingHashtags = false;
        },
        clearError: (state) => {
            state.error = null;
        },

        // Reset all AI state
        resetAIState: () => initialState,
    },
});

export const {
    setSuggestions,
    setGeneratingSuggestions,
    clearSuggestions,
    setHashtags,
    setGeneratingHashtags,
    clearHashtags,
    setSelectedTone,
    toggleAutoComplete,
    toggleAIAssistant,
    setShowSuggestionPanel,
    setActiveFeature,
    setError,
    clearError,
    resetAIState,
} = aiSlice.actions;

export default aiSlice.reducer;
