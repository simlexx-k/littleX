import React from 'react';
import { Sparkles } from 'lucide-react';
import { cn } from '@/_core/utils';

interface AIAssistedBadgeProps {
    className?: string;
    size?: 'sm' | 'md';
}

export const AIAssistedBadge: React.FC<AIAssistedBadgeProps> = ({
    className,
    size = 'sm'
}) => {
    return (
        <div
            className={cn(
                'inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary border border-primary/20',
                size === 'sm' && 'px-2 py-0.5 text-xs',
                size === 'md' && 'px-3 py-1 text-sm',
                className
            )}
            title="This content was created with AI assistance"
        >
            <Sparkles className={cn(
                size === 'sm' && 'w-3 h-3',
                size === 'md' && 'w-4 h-4'
            )} />
            <span className="font-medium">AI-assisted</span>
        </div>
    );
};
