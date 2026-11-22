import { Link, useNavigate } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';
import { ResearcherDetailContent } from './researcher-detail-content';

/** Página direta do pesquisador (`/console/pesquisadores/$researcherId`, no F5 ou link direto). */
export function ResearcherDetailPage({
  researcherId,
}: {
  researcherId: string;
}) {
  const navigate = useNavigate({
    from: '/console/pesquisadores/$researcherId',
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold tracking-tight">
            Detalhes do pesquisador
          </h1>
          <p className="text-sm text-muted-foreground">
            Edite os dados, gerencie vínculos e dispare a sincronização do
            Lattes.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/console/pesquisadores">
            <ArrowLeft aria-hidden />
            Voltar para pesquisadores
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <ResearcherDetailContent
            researcherId={researcherId}
            onDeleted={() => void navigate({ to: '/console/pesquisadores' })}
          />
        </CardContent>
      </Card>
    </div>
  );
}
