import React from 'react';
import { Hash, Sparkles, X } from 'lucide-react';
import { cn } from '@/_core/utils';
import { Button } from '@/ds/atoms/button';
import { LoadingDots } from '@/ds/atoms/loading-dots';
import type { HashtagSuggestion } from '@/modules/ai';

interface HashtagGeneratorProps {
    hashtags: HashtagSuggestion[];
    isGenerating: boolean;
    onGenerate: () => void;
    onAddHashtag: (tag: string) => void;
    onRemoveHashtag: (index: number) => void;
    className?: string;
}

export const HashtagGenerator: React.FC<HashtagGeneratorProps> = ({
    hashtags,
    isGenerating,
    onGenerate,
    onAddHashtag,
    onRemoveHashtag,
    className,
}) => {
    return (
        <div className={cn('flex flex-col gap-2', className)}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Hash className="w-4 h-4" />
                    <span>Hashtags</span>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onGenerate}
                    disabled={isGenerating}
                    className="gap-1.5"
                >
                    {isGenerating ? (
                        <>
                            <LoadingDots size="sm" />
                            <span>Generating...</span>
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Generate</span>
                        </>
                    )}
                </Button>
            </div>

            {hashtags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {hashtags.map((hashtag, index) => (
                        <button
                            key={index}
                            onClick={() => onAddHashtag(hashtag.tag)}
                            className={cn(
                                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm',
                                'bg-primary/10 hover:bg-primary/20 text-primary',
                                'border border-primary/20',
                                'transition-colors duration-200',
                                'group'
                            )}
                        >
                            <span className="font-medium">{hashtag.tag}</span>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRemoveHashtag(index);
                                }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                aria-label="Remove hashtag"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
