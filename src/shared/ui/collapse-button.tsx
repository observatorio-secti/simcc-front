import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from './button';

/**
 * Botão de recolher/expandir de seção e toolbar: `ChevronUp` aberto,
 * `ChevronDown` fechado, com `aria-expanded`.
 */
export function CollapseButton({
  open,
  onOpenChange,
  controls,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** `id` do conteúdo controlado (`aria-controls`). */
  controls?: string;
}) {
  const Icon = open ? ChevronUp : ChevronDown;

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label={open ? 'Recolher' : 'Expandir'}
      aria-expanded={open}
      aria-controls={controls}
      onClick={() => onOpenChange(!open)}
    >
      <Icon aria-hidden />
    </Button>
  );
}
