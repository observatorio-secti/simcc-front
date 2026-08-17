import { Alert } from '../ui/alert';

export function PopUpAnuncio() {
  return (
    <div className="fixed right-16 bottom-16">
      <Alert className="flex gap-3 items-center border-eng-blue dark:border-eng-blue shadow-lg">
        <div>
          <p>Veja mais em {'iapos.cimatec.com.br'}</p>
          <p></p>
        </div>
      </Alert>
    </div>
  );
}
