import { useState } from 'react';
import { User } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { researcherInitials } from '../model';

export type ResearcherAvatarSize = 'sm' | 'md' | 'lg';

export interface ResearcherAvatarProps {
  name: string;
  imageUrl?: string | null;
  size?: ResearcherAvatarSize;
  /** Quando `true`, oculta o avatar de leitores de tela (ex.: ao lado do nome). */
  decorative?: boolean;
  className?: string;
}

const SIZE_CLASSES: Record<ResearcherAvatarSize, string> = {
  sm: 'size-5 rounded-full text-[10px] font-bold',
  md: 'size-10 rounded-lg',
  lg: 'size-24 rounded-lg border-4 border-card shadow-md',
};

const ICON_CLASSES: Record<ResearcherAvatarSize, string> = {
  sm: 'size-3',
  md: 'size-5 opacity-75',
  lg: 'size-11 opacity-60',
};

/**
 * Avatar do pesquisador (`sc-avatar` / `sc-avatar--sm` no kit).
 * Usa `rounded-full` apenas no tamanho `sm` e `rounded-lg` nos demais (`DESIGN.md` §4).
 */
export function ResearcherAvatar({
  name,
  imageUrl,
  size = 'md',
  decorative = false,
  className,
}: ResearcherAvatarProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const src = imageUrl?.trim() ? imageUrl.trim() : null;
  const showImage = src !== null && failedSrc !== src;

  return (
    <span
      data-slot="researcher-avatar"
      data-size={size}
      aria-hidden={decorative || undefined}
      role={decorative || showImage ? undefined : 'img'}
      aria-label={decorative || showImage ? undefined : name}
      className={cn(
        'relative inline-grid shrink-0 place-items-center overflow-hidden select-none',
        showImage
          ? 'bg-neutral-200 dark:bg-neutral-800'
          : size === 'sm'
            ? 'bg-eng-blue text-white'
            : 'bg-gradient-to-br from-slate-400 to-slate-600 text-white',
        SIZE_CLASSES[size],
        className,
      )}
    >
      {showImage ? (
        <img
          src={src}
          alt={decorative ? '' : name}
          loading="lazy"
          className="size-full object-cover"
          onError={() => setFailedSrc(src)}
        />
      ) : size === 'sm' ? (
        <span>{researcherInitials(name)}</span>
      ) : (
        <User className={ICON_CLASSES[size]} aria-hidden />
      )}
    </span>
  );
}
