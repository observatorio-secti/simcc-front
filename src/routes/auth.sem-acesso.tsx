import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { AccessDeniedPage } from '@/features/auth';

const accessDeniedSearchSchema = z.object({
  from: z.string().optional().catch(undefined),
  reason: z.enum(['idp_unconfigured']).optional().catch(undefined),
});

export const Route = createFileRoute('/auth/sem-acesso')({
  validateSearch: accessDeniedSearchSchema,
  component: AccessDeniedRoute,
});

function AccessDeniedRoute() {
  const { from, reason } = Route.useSearch();
  const { session } = Route.useRouteContext();

  return <AccessDeniedPage from={from} reason={reason} session={session} />;
}
