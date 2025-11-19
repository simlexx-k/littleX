import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/_core/utils';
import type { ToneType } from '@/modules/ai';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/ds/atoms/dropdown-menu';
import { Button } from '@/ds/atoms/button';
import { ToneBadge } from '@/ds/atoms/tone-badge';

interface ToneSwitcherProps {
    selectedTone: ToneType;
    onToneChange: (tone: ToneType) => void;
    className?: string;
}

const tones: Array<{ value: ToneType; label: string; description: string }> = [
    { value: 'casual', label: 'Casual', description: 'Relaxed and conversational' },
    { value: 'professional', label: 'Professional', description: 'Formal and business-like' },
    { value: 'friendly', label: 'Friendly', description: 'Warm and approachable' },
    { value: 'humorous', label: 'Humorous', description: 'Fun and entertaining' },
];

export const ToneSwitcher: React.FC<ToneSwitcherProps> = ({
    selectedTone,
    onToneChange,
    className,
}) => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className={cn('gap-2', className)}>
                    <span className="text-xs text-muted-foreground">Tone:</span>
                    <ToneBadge tone={selectedTone} />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                {tones.map((tone) => (
                    <DropdownMenuItem
                        key={tone.value}
                        onClick={() => onToneChange(tone.value)}
                        className="flex items-start gap-2 cursor-pointer"
                    >
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <span className="font-medium">{tone.label}</span>
                                {selectedTone === tone.value && (
                                    <Check className="w-4 h-4 text-primary" />
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                {tone.description}
                            </p>
                        </div>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
