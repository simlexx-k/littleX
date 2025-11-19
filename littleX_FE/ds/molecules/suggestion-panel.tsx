import React from 'react';
import { X, Sparkles } from 'lucide-react';
import { cn } from '@/_core/utils';
import { AIChip } from '@/ds/atoms/ai-chip';
import { LoadingDots } from '@/ds/atoms/loading-dots';
import type { AISuggestion } from '@/modules/ai';

interface SuggestionPanelProps {
    suggestions: AISuggestion[];
    isLoading: boolean;
    onSelectSuggestion: (text: string) => void;
    onClose: () => void;
    className?: string;
}

export const SuggestionPanel: React.FC<SuggestionPanelProps> = ({
    suggestions,
    isLoading,
    onSelectSuggestion,
    onClose,
    className,
}) => {
    if (!isLoading && suggestions.length === 0) return null;

    return (
        <div
            className={cn(
                'absolute z-10 mt-2 p-4 rounded-lg border bg-card shadow-lg',
                'w-full max-w-md',
                className
            )}
        >
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-semibold">AI Suggestions</h3>
                </div>
                <button
                    onClick={onClose}
                    className="p-1 rounded-md hover:bg-accent transition-colors"
                    aria-label="Close suggestions"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {isLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                    <LoadingDots size="sm" />
                    <span>Generating suggestions...</span>
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                    {suggestions.map((suggestion, index) => (
                        <AIChip
                            key={index}
                            text={suggestion.text}
                            confidence={suggestion.confidence}
                            onClick={() => onSelectSuggestion(suggestion.text)}
                            className="w-full justify-start text-left"
                        />
                    ))}
                </div>
            )}

            <p className="text-xs text-muted-foreground mt-3">
                Click a suggestion to use it in your tweet
            </p>
        </div>
    );
};
