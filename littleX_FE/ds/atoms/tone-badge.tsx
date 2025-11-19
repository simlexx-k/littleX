import React from 'react';
import { cn } from '@/_core/utils';
import type { ToneType } from '@/modules/ai';

interface ToneBadgeProps {
    tone: ToneType;
    className?: string;
}

const toneConfig: Record<ToneType, { label: string; color: string; emoji: string }> = {
    casual: { label: 'Casual', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300', emoji: '😊' },
    professional: { label: 'Professional', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300', emoji: '💼' },
    friendly: { label: 'Friendly', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', emoji: '👋' },
    humorous: { label: 'Humorous', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300', emoji: '😄' },
};

export const ToneBadge: React.FC<ToneBadgeProps> = ({ tone, className }) => {
    const config = toneConfig[tone];

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium',
                config.color,
                className
            )}
        >
            <span>{config.emoji}</span>
            <span>{config.label}</span>
        </span>
    );
};
