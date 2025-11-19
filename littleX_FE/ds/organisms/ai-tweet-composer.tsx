import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Sparkles, Send } from 'lucide-react';
import { cn } from '@/_core/utils';
import { useAI } from '@/modules/ai';
import { Button } from '@/ds/atoms/button';
import { Textarea } from '@/ds/atoms/textarea';
import { Switch } from '@/ds/atoms/switch';
import { Label } from '@/ds/atoms/label';
import { ToneSwitcher } from '@/ds/molecules/tone-switcher';
import { SuggestionPanel } from '@/ds/molecules/suggestion-panel';
import { HashtagGenerator } from '@/ds/molecules/hashtag-generator';

interface AITweetComposerProps {
    onSubmit: (content: string, metadata?: { aiAssisted: boolean }) => void;
    placeholder?: string;
    maxLength?: number;
    className?: string;
}

export const AITweetComposer: React.FC<AITweetComposerProps> = ({
    onSubmit,
    placeholder = "What's on your mind?",
    maxLength = 280,
    className,
}) => {
    const [content, setContent] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [aiWasUsed, setAiWasUsed] = useState(false);
    const [showAiTag, setShowAiTag] = useState(true);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const debounceTimerRef = useRef<NodeJS.Timeout>();

    const {
        aiAssistantEnabled,
        selectedTone,
        suggestions,
        isGeneratingSuggestions,
        hashtags,
        isGeneratingHashtags,
        generateSuggestions,
        generateHashtags,
        changeTone,
        toggleAI,
        clearSuggestions,
        clearHashtags,
    } = useAI();

    // Auto-generate suggestions when user pauses typing
    useEffect(() => {
        if (!aiAssistantEnabled || content.length < 10) {
            clearSuggestions();
            setShowSuggestions(false);
            return;
        }

        // Clear existing timer
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        // Set new timer
        debounceTimerRef.current = setTimeout(() => {
            generateSuggestions(content);
            setShowSuggestions(true);
        }, 1000); // Wait 1 second after user stops typing

        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [content, aiAssistantEnabled, generateSuggestions, clearSuggestions]);

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newContent = e.target.value;
        if (newContent.length <= maxLength) {
            setContent(newContent);
        }
    };

    const handleSelectSuggestion = useCallback((text: string) => {
        setContent(text);
        setShowSuggestions(false);
        clearSuggestions();
        setAiWasUsed(true); // Mark that AI was used
        textareaRef.current?.focus();
    }, [clearSuggestions]);

    const handleGenerateHashtags = useCallback(() => {
        if (content.trim()) {
            generateHashtags(content);
        }
    }, [content, generateHashtags]);

    const handleAddHashtag = useCallback((tag: string) => {
        const newContent = content.trim() + ' ' + tag;
        if (newContent.length <= maxLength) {
            setContent(newContent);
            setAiWasUsed(true); // Mark that AI was used
            textareaRef.current?.focus();
        }
    }, [content, maxLength]);

    const handleRemoveHashtag = useCallback((index: number) => {
        const newHashtags = hashtags.filter((_, i) => i !== index);
        // Update Redux state would happen here
    }, [hashtags]);

    const handleSubmit = () => {
        if (content.trim()) {
            onSubmit(content.trim(), {
                aiAssisted: aiWasUsed && showAiTag
            });
            setContent('');
            clearSuggestions();
            clearHashtags();
            setShowSuggestions(false);
            setAiWasUsed(false); // Reset AI usage tracking
        }
    };

    const remainingChars = maxLength - content.length;
    const isOverLimit = remainingChars < 0;
    const isNearLimit = remainingChars < 20 && remainingChars >= 0;

    return (
        <div className={cn('space-y-4', className)}>
            {/* AI Toggle and Settings */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Switch
                            id="ai-assistant"
                            checked={aiAssistantEnabled}
                            onCheckedChange={toggleAI}
                        />
                        <Label htmlFor="ai-assistant" className="flex items-center gap-1.5 cursor-pointer">
                            <Sparkles className="w-4 h-4 text-primary" />
                            <span>AI Assistant</span>
                        </Label>
                    </div>

                    {aiAssistantEnabled && aiWasUsed && (
                        <div className="flex items-center gap-2">
                            <Switch
                                id="ai-tag"
                                checked={showAiTag}
                                onCheckedChange={setShowAiTag}
                            />
                            <Label htmlFor="ai-tag" className="text-xs text-muted-foreground cursor-pointer">
                                Show "AI-assisted" tag
                            </Label>
                        </div>
                    )}
                </div>

                {aiAssistantEnabled && (
                    <ToneSwitcher selectedTone={selectedTone} onToneChange={changeTone} />
                )}
            </div>

            {/* Text Input Area */}
            <div className="relative">
                <Textarea
                    ref={textareaRef}
                    value={content}
                    onChange={handleContentChange}
                    placeholder={placeholder}
                    className={cn(
                        'min-h-[120px] resize-none',
                        isOverLimit && 'border-destructive focus-visible:ring-destructive'
                    )}
                    disabled={!aiAssistantEnabled && content.length === 0}
                />

                {/* Character Count */}
                <div className="absolute bottom-3 right-3 text-xs">
                    <span
                        className={cn(
                            'font-medium',
                            isOverLimit && 'text-destructive',
                            isNearLimit && 'text-yellow-600 dark:text-yellow-500',
                            !isOverLimit && !isNearLimit && 'text-muted-foreground'
                        )}
                    >
                        {remainingChars}
                    </span>
                </div>

                {/* AI Suggestions Panel */}
                {aiAssistantEnabled && showSuggestions && (
                    <SuggestionPanel
                        suggestions={suggestions}
                        isLoading={isGeneratingSuggestions}
                        onSelectSuggestion={handleSelectSuggestion}
                        onClose={() => setShowSuggestions(false)}
                    />
                )}
            </div>

            {/* Hashtag Generator */}
            {aiAssistantEnabled && content.length > 10 && (
                <HashtagGenerator
                    hashtags={hashtags}
                    isGenerating={isGeneratingHashtags}
                    onGenerate={handleGenerateHashtags}
                    onAddHashtag={handleAddHashtag}
                    onRemoveHashtag={handleRemoveHashtag}
                />
            )}

            {/* Submit Button */}
            <div className="flex justify-end">
                <Button
                    onClick={handleSubmit}
                    disabled={!content.trim() || isOverLimit}
                    className="gap-2"
                >
                    <Send className="w-4 h-4" />
                    <span>Post Tweet</span>
                </Button>
            </div>

            {/* AI Hint */}
            {aiAssistantEnabled && content.length === 0 && (
                <p className="text-xs text-muted-foreground text-center">
                    Start typing and AI will suggest improvements as you write
                </p>
            )}
        </div>
    );
};
