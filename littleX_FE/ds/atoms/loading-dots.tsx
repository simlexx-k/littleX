import React from 'react';
import { cn } from '@/_core/utils';

interface LoadingDotsProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

export const LoadingDots: React.FC<LoadingDotsProps> = ({ className, size = 'md' }) => {
    const sizeClasses = {
        sm: 'w-1 h-1',
        md: 'w-1.5 h-1.5',
        lg: 'w-2 h-2',
    };

    return (
        <div className={cn('flex items-center gap-1', className)}>
            {[0, 1, 2].map((i) => (
                <div
                    key={i}
                    className={cn(
                        'rounded-full bg-current animate-pulse',
                        sizeClasses[size]
                    )}
                    style={{
                        animationDelay: `${i * 0.15}s`,
                        animationDuration: '1s',
                    }}
                />
            ))}
        </div>
    );
};
