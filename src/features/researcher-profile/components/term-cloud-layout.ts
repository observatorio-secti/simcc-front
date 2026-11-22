import type { ResearcherTerm } from '@/entities/researcher/model';

export const TERM_CLOUD_WIDTH = 320;
export const TERM_CLOUD_HEIGHT = 240;
export const DEFAULT_MAX_TERMS = 18;

const MIN_FONT_SIZE = 11;
const MAX_FONT_SIZE = 24;
const MIN_FIT_FONT_SIZE = 10;
const PADDING_X = 6;
const PADDING_Y = 4;
const MARGIN = 6;
const MAX_SPIRAL_STEPS = 450;

export interface PlacedTerm {
  term: string;
  frequency: number;
  x: number;
  y: number;
  fontSize: number;
  fontWeight: 500 | 600 | 700;
  rotate: 0 | -90;
  colorClass: string;
}

interface BoundingBox {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

function getColorClass(ratio: number): string {
  if (ratio >= 0.75) return 'text-primary';
  if (ratio >= 0.45) return 'text-foreground';
  if (ratio >= 0.2) return 'text-foreground/75';
  return 'text-muted-foreground';
}

function getFontWeight(ratio: number): 500 | 600 | 700 {
  if (ratio >= 0.7) return 700;
  if (ratio >= 0.35) return 600;
  return 500;
}

function estimateBox(
  term: string,
  fontSize: number,
  fontWeight: 500 | 600 | 700,
  rotate: 0 | -90,
  cx: number,
  cy: number,
): BoundingBox {
  const charFactor = fontWeight >= 600 ? 0.6 : 0.56;
  const textWidth = Math.max(fontSize, term.length * fontSize * charFactor);
  const textHeight = fontSize * 1.15;

  const boxWidth = (rotate === -90 ? textHeight : textWidth) + PADDING_X;
  const boxHeight = (rotate === -90 ? textWidth : textHeight) + PADDING_Y;

  return {
    left: cx - boxWidth / 2,
    right: cx + boxWidth / 2,
    top: cy - boxHeight / 2,
    bottom: cy + boxHeight / 2,
  };
}

function fitsInCanvas(
  box: BoundingBox,
  width: number,
  height: number,
): boolean {
  return (
    box.left >= MARGIN &&
    box.right <= width - MARGIN &&
    box.top >= MARGIN &&
    box.bottom <= height - MARGIN
  );
}

function overlaps(a: BoundingBox, b: BoundingBox): boolean {
  return !(
    a.right <= b.left ||
    a.left >= b.right ||
    a.bottom <= b.top ||
    a.top >= b.bottom
  );
}

function tryPlaceTerm(
  term: string,
  fontSize: number,
  fontWeight: 500 | 600 | 700,
  rotate: 0 | -90,
  index: number,
  placedBoxes: readonly BoundingBox[],
  width: number,
  height: number,
): { x: number; y: number; box: BoundingBox } | null {
  const centerX = width / 2;
  const centerY = height / 2;
  const initialAngle = index * 1.1;

  for (let step = 0; step < MAX_SPIRAL_STEPS; step += 1) {
    const angle = initialAngle + step * 0.35;
    const radiusX = step === 0 ? 0 : 1.55 * (step * 0.35);
    const radiusY = step === 0 ? 0 : 1.15 * (step * 0.35);

    const x = Math.round((centerX + radiusX * Math.cos(angle)) * 10) / 10;
    const y = Math.round((centerY + radiusY * Math.sin(angle)) * 10) / 10;

    const box = estimateBox(term, fontSize, fontWeight, rotate, x, y);
    if (!fitsInCanvas(box, width, height)) {
      continue;
    }

    const hasCollision = placedBoxes.some((existing) =>
      overlaps(box, existing),
    );
    if (!hasCollision) {
      return { x, y, box };
    }
  }

  return null;
}

/**
 * Calcula posições determinísticas em espiral de Arquimedes para uma nuvem
 * de termos em SVG, sem depender de medição de DOM (`getBBox`/`canvas`).
 */
export function computeTermCloudLayout(
  terms: readonly ResearcherTerm[],
  options: {
    maxTerms?: number;
    width?: number;
    height?: number;
  } = {},
): PlacedTerm[] {
  const maxTerms = options.maxTerms ?? DEFAULT_MAX_TERMS;
  const width = options.width ?? TERM_CLOUD_WIDTH;
  const height = options.height ?? TERM_CLOUD_HEIGHT;

  if (maxTerms <= 0) return [];

  const normalized = terms
    .map((item) => ({
      term: item.term.trim(),
      frequency: item.frequency,
    }))
    .filter((item) => item.term.length > 0)
    .sort(
      (a, b) =>
        b.frequency - a.frequency || a.term.localeCompare(b.term, 'pt-BR'),
    )
    .slice(0, maxTerms);

  if (normalized.length === 0) return [];

  const frequencies = normalized.map((item) => item.frequency);
  const minFreq = Math.min(...frequencies);
  const maxFreq = Math.max(...frequencies);

  const placed: PlacedTerm[] = [];
  const placedBoxes: BoundingBox[] = [];

  for (const [index, item] of normalized.entries()) {
    const ratio =
      maxFreq === minFreq
        ? 0.6
        : (item.frequency - minFreq) / (maxFreq - minFreq);

    const rawFontSize = MIN_FONT_SIZE + ratio * (MAX_FONT_SIZE - MIN_FONT_SIZE);
    const maxSafeFontSize =
      (width - MARGIN * 2 - PADDING_X) / Math.max(1, item.term.length * 0.6);
    const initialFontSize = Math.max(
      MIN_FIT_FONT_SIZE,
      Math.round(Math.min(rawFontSize, maxSafeFontSize) * 10) / 10,
    );

    const fontWeight = getFontWeight(ratio);
    const colorClass = getColorClass(ratio);
    const shouldRotate = index > 2 && index % 4 === 3 && item.term.length <= 12;
    const preferredRotate: 0 | -90 = shouldRotate ? -90 : 0;

    let candidate = tryPlaceTerm(
      item.term,
      initialFontSize,
      fontWeight,
      preferredRotate,
      index,
      placedBoxes,
      width,
      height,
    );

    let finalRotate = preferredRotate;
    let finalFontSize = initialFontSize;

    if (!candidate && preferredRotate === -90) {
      finalRotate = 0;
      candidate = tryPlaceTerm(
        item.term,
        initialFontSize,
        fontWeight,
        0,
        index,
        placedBoxes,
        width,
        height,
      );
    }

    if (!candidate && initialFontSize > MIN_FIT_FONT_SIZE) {
      finalFontSize = Math.max(
        MIN_FIT_FONT_SIZE,
        Math.round(initialFontSize * 0.8 * 10) / 10,
      );
      candidate = tryPlaceTerm(
        item.term,
        finalFontSize,
        fontWeight,
        finalRotate,
        index,
        placedBoxes,
        width,
        height,
      );
    }

    if (!candidate) continue;

    placedBoxes.push(candidate.box);
    placed.push({
      term: item.term,
      frequency: item.frequency,
      x: candidate.x,
      y: candidate.y,
      fontSize: finalFontSize,
      fontWeight,
      rotate: finalRotate,
      colorClass,
    });
  }

  return placed;
}
