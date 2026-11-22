/** Mensagem legível de qualquer erro (o `ApiError` já vem em pt-BR). */
export function errorMessage(error: unknown): string {
  return error instanceof Error && error.message
    ? error.message
    : 'Não foi possível carregar os dados.';
}
