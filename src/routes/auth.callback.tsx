import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { AuthCallbackPage } from '@/features/auth';

const callbackSearchSchema = z.object({
  code: z.string().optional().catch(undefined),
  state: z.string().optional().catch(undefined),
  error: z.string().optional().catch(undefined),
  error_description: z.string().optional().catch(undefined),
});

export const Route = createFileRoute('/auth/callback')({
  validateSearch: callbackSearchSchema,
  component: AuthCallbackRoute,
});

function AuthCallbackRoute() {
  const { code, state, error, error_description } = Route.useSearch();
  const { session } = Route.useRouteContext();

  return (
    <AuthCallbackPage
      code={code}
      state={state}
      error={error}
      errorDescription={error_description}
      session={session}
    />
  );
}
