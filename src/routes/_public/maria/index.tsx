import { createFileRoute } from '@tanstack/react-router';
import { MariaHomePage } from '@/features/maria/maria-home-page';

export const Route = createFileRoute('/_public/maria/')({
  component: MariaHomePage,
});
