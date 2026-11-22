import { createFileRoute, Outlet } from '@tanstack/react-router';

// Só dá o segmento "MarIA" ao breadcrumb de `/maria` e `/maria/$conversationId`.
export const Route = createFileRoute('/_public/maria')({
  staticData: { crumb: 'MarIA' },
  component: Outlet,
});
