import React from 'react';
import { Sparkles } from 'lucide-react';
import { cn } from '@/_core/utils';

interface AIChipProps {
    text: string;
    confidence?: number;
    onClick?: () => void;
    className?: string;
}

export const AIChip: React.FC<AIChipProps> = ({
    text,
    confidence = 1,
    onClick,
    className
}) => {
    const confidenceColor = confidence > 0.8
        ? 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700'
        : confidence > 0.6
            ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700'
            : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600';

    return (
        <button
            onClick={onClick}
            className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm',
                'border transition-all duration-200',
                'hover:scale-105 hover:shadow-md',
                'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
                confidenceColor,
                className
            )}
        >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="font-medium">{text}</span>
        </button>
    );
};
