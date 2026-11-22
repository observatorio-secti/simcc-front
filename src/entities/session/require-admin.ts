import { redirect } from '@tanstack/react-router';
import { sanitizeReturnTo } from '@/api/idp';
import type { SessionSnapshot, SessionStore } from './session-store';

export interface RequireAdminParams {
  context: { session: SessionStore };
  location: { href: string };
}

/**
 * Guard para `beforeLoad` de rotas protegidas do Console (`/console/*`):
 * - sem sessão em memória: tenta retomar silenciosamente via `prompt=none`
 *   preservando a rota de destino no `state`;
 * - autenticado sem `is_admin`: redireciona para a tela de "sem acesso";
 * - admin: devolve `{ viewer }` ao contexto das rotas filhas (sem sobrescrever
 *   `context.session`, que continua sendo a store);
 * - erro transitório (ex.: 502/504 em `/me` com tokens ativos): propaga o erro
 *   sem encerrar a sessão.
 */
export async function requireAdmin({
  context,
  location,
}: RequireAdminParams): Promise<{ viewer: SessionSnapshot }> {
  const { session } = context;
  const snapshot = await session.ensureSession();

  if (snapshot.status === 'authenticated') {
    if (snapshot.isAdmin) {
      return { viewer: snapshot };
    }
    throw redirect({
      to: '/auth/sem-acesso',
      search: { from: sanitizeReturnTo(location.href) },
    });
  }

  if (snapshot.error && session.hasTokensInMemory()) {
    throw snapshot.error;
  }

  if (session.isIdpConfigured()) {
    const authorizeUrl = await session.login({
      prompt: 'none',
      returnTo: location.href,
      redirect: false,
    });
    throw redirect({
      href: authorizeUrl,
      reloadDocument: true,
    });
  }

  throw redirect({
    to: '/auth/sem-acesso',
    search: {
      from: sanitizeReturnTo(location.href),
      reason: 'idp_unconfigured',
    },
  });
}
