import { Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center p-4">
      <main className="w-full max-w-md rounded-lg border bg-card p-8 text-center">
        <p className="text-2xl font-bold">404</p>
        <h1 className="mt-2 text-xl font-semibold tracking-tight">
          Página não encontrada
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          O endereço pode ter mudado com a nova versão da plataforma.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex h-9 items-center gap-2 rounded-md bg-eng-blue px-4 text-sm font-medium text-white transition-colors hover:bg-eng-dark-blue focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Voltar ao início
        </Link>
      </main>
    </div>
  );
}
