import { createFileRoute, Outlet } from '@tanstack/react-router';
import { PublicLayout } from '@/features/shell/public-layout';

export const Route = createFileRoute('/_public')({
  component: PublicLayoutRoute,
});

function PublicLayoutRoute() {
  return (
    <PublicLayout>
      <Outlet />
    </PublicLayout>
  );
}
