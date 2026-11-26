/** Define o intervalo de exibição dos rótulos no eixo X para evitar sobreposição. */
export function getYearLabelStep(total: number): number {
  if (total <= 14) return 1;
  if (total <= 28) return 2;
  if (total <= 45) return 3;
  return Math.ceil(total / 12);
}
