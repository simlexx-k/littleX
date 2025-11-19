import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '@/store';
import { AIService, type ToneType } from '../services';
import {
    setSuggestions,
    setGeneratingSuggestions,
    setHashtags,
    setGeneratingHashtags,
    setSelectedTone,
    toggleAutoComplete,
    toggleAIAssistant,
    setShowSuggestionPanel,
    setError,
    clearSuggestions,
    clearHashtags,
} from '@/store/aiSlice';

export const useAI = () => {
    const dispatch = useDispatch<AppDispatch>();
    const aiState = useSelector((state: RootState) => state.ai);

    /**
     * Generate content suggestions based on context
     */
    const generateSuggestions = useCallback(async (context: string, tone?: ToneType) => {
        if (!aiState.aiAssistantEnabled || context.length < 3) return;

        try {
            dispatch(setGeneratingSuggestions(true));
            const suggestions = await AIService.suggestContent(context, tone || aiState.selectedTone);
            dispatch(setSuggestions(suggestions));
            dispatch(setShowSuggestionPanel(true));
        } catch (error) {
            dispatch(setError('Failed to generate suggestions'));
            console.error('Error generating suggestions:', error);
        }
    }, [dispatch, aiState.aiAssistantEnabled, aiState.selectedTone]);

    /**
     * Generate hashtags for content
     */
    const generateHashtags = useCallback(async (content: string) => {
        if (!aiState.aiAssistantEnabled || content.length < 10) return;

        try {
            dispatch(setGeneratingHashtags(true));
            const hashtags = await AIService.generateHashtags(content);
            dispatch(setHashtags(hashtags));
        } catch (error) {
            dispatch(setError('Failed to generate hashtags'));
            console.error('Error generating hashtags:', error);
        }
    }, [dispatch, aiState.aiAssistantEnabled]);

    /**
     * Improve text with AI
     */
    const improveText = useCallback(async (text: string, style?: ToneType) => {
        if (!aiState.aiAssistantEnabled || text.length < 5) return null;

        try {
            const improvement = await AIService.improveText(text, style || aiState.selectedTone);
            return improvement;
        } catch (error) {
            dispatch(setError('Failed to improve text'));
            console.error('Error improving text:', error);
            return null;
        }
    }, [dispatch, aiState.aiAssistantEnabled, aiState.selectedTone]);

    /**
     * Get autocomplete suggestions
     */
    const getAutoComplete = useCallback(async (partial: string) => {
        if (!aiState.aiAssistantEnabled || !aiState.autoCompleteEnabled) return [];

        try {
            const suggestions = await AIService.getAutoComplete(partial);
            return suggestions;
        } catch (error) {
            console.error('Error getting autocomplete:', error);
            return [];
        }
    }, [aiState.aiAssistantEnabled, aiState.autoCompleteEnabled]);

    /**
     * Change writing tone
     */
    const changeTone = useCallback((tone: ToneType) => {
        dispatch(setSelectedTone(tone));
    }, [dispatch]);

    /**
     * Toggle autocomplete feature
     */
    const toggleAutoCompleteFeature = useCallback(() => {
        dispatch(toggleAutoComplete());
    }, [dispatch]);

    /**
     * Toggle AI assistant
     */
    const toggleAI = useCallback(() => {
        dispatch(toggleAIAssistant());
    }, [dispatch]);

    /**
     * Clear all suggestions
     */
    const clearAllSuggestions = useCallback(() => {
        dispatch(clearSuggestions());
        dispatch(setShowSuggestionPanel(false));
    }, [dispatch]);

    /**
     * Clear hashtags
     */
    const clearAllHashtags = useCallback(() => {
        dispatch(clearHashtags());
    }, [dispatch]);

    return {
        // State
        ...aiState,

        // Actions
        generateSuggestions,
        generateHashtags,
        improveText,
        getAutoComplete,
        changeTone,
        toggleAutoComplete: toggleAutoCompleteFeature,
        toggleAI,
        clearSuggestions: clearAllSuggestions,
        clearHashtags: clearAllHashtags,
    };
};
