import { useContext } from 'react';
import { Alert } from '../../../ui/alert';
import { UserContext } from '../../../../context/context';
import { CardHeader, CardTitle } from '../../../ui/card';
import { useInstitutions } from '../../../../hooks/use-institution-queries';

type Institutions = {
  among: string;
  id: string;
  image: string;
  institution: string;
};

export function InstitutionsItem(props: Institutions) {
  const { urlGeral } = useContext(UserContext);
  const { data: institutions } = useInstitutions();

  const buildAssetUrl = (path?: string | null) => {
    if (!path) return null;
    if (/^https?:\/\//.test(path)) return path;
    const base = (urlGeral || '').replace(/\/$/, '');
    return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  const matched = (institutions as any[])?.find((i: any) => i.id === props.id);
  const logoUrl = buildAssetUrl(matched?.image);
  const coverUrl = buildAssetUrl(matched?.cover);

  return (
    <div className="flex w-full group">
      <Alert className=" flex flex-col p-0 justify-between">
        <CardHeader className="flex p-0  justify-between space-y-0 pb-2">
          <div className="mb-3">
            <div>
              <Alert
                className="rounded-md border-0 border-b h-32 rounded-b-none bg-no-repeat bg-center bg-cover bg-neutral-100 dark:bg-neutral-100"
                style={{
                  backgroundImage: coverUrl ? `url(${coverUrl})` : undefined,
                  backgroundColor: coverUrl ? undefined : '#f5f5f5',
                }}
              ></Alert>
              <div className="relative group w-fit -top-8 px-4">
                <Alert
                  className="aspect-square bg-no-repeat bg-center bg-contain rounded-md h-20 bg-white dark:bg-white border"
                  style={{
                    backgroundImage: logoUrl ? `url(${logoUrl})` : undefined,
                    backgroundColor: 'white',
                  }}
                ></Alert>
              </div>
            </div>
          </div>
          <div className="px-4">
            <CardTitle className="text-xl font-medium -top-4  relative">
              {props.institution}
            </CardTitle>
          </div>
        </CardHeader>
      </Alert>
    </div>
  );
}
