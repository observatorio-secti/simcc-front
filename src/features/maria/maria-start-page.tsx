import { useRouter } from '@tanstack/react-router';
import { AlertTriangle } from 'lucide-react';
import { errorMessage } from '@/shared/lib/error-message';
import { Button } from '@/shared/ui/button';
import { LoadingBlock } from '@/shared/ui/loading-block';
import { Composer } from './components/composer';
import { MariaLayout } from './components/maria-layout';
import { MARIA_DISCLAIMER } from './texts';

// `/maria` cria a conversa no loader da rota (uma vez por acesso, fora do
// ciclo de render) e redireciona para `/maria/$conversationId`. Estas são as
// telas de "criando" e de falha na criação.

function DisabledComposer() {
  return (
    <Composer
      value=""
      onValueChange={() => {}}
      onSubmit={() => {}}
      disabled
      notice={MARIA_DISCLAIMER}
    />
  );
}

/** Enquanto `POST /conversations` não responde: carregando, envio desligado. */
export function MariaStartingPage() {
  return (
    <MariaLayout>
      <div className="mx-auto flex w-full max-w-[860px] flex-1 flex-col justify-between gap-6">
        <LoadingBlock
          title="Iniciando a conversa..."
          caption="Preparando a MarIA, aguarde um instante"
        />
        <DisabledComposer />
      </div>
    </MariaLayout>
  );
}

/** Falha ao criar a conversa, com "Tentar novamente" (roda o loader de novo). */
export function MariaStartErrorPage({ error }: { error: unknown }) {
  const router = useRouter();
  return (
    <MariaLayout>
      <div className="mx-auto flex w-full max-w-[860px] flex-1 flex-col justify-between gap-6">
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
        >
          <span className="flex items-start gap-2.5">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>
              Não foi possível iniciar a conversa. {errorMessage(error)}
            </span>
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void router.invalidate()}
          >
            Tentar novamente
          </Button>
        </div>
        <DisabledComposer />
      </div>
    </MariaLayout>
  );
}
