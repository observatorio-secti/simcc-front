import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

export const Route = createFileRoute('/_public/')({
  staticData: { crumb: 'Página inicial' },
  component: PublicHomePlaceholder,
});

function PublicHomePlaceholder() {
  return (
    <section className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center py-8">
      <Card>
        <CardHeader>
          <p className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
            Moldura pública ativa
          </p>
          <CardTitle className="text-xl font-semibold tracking-tight">
            Página inicial
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Esta é a rota inicial dentro da moldura de navegação. A busca e o
            panorama da página inicial entram na tarefa T1.
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
