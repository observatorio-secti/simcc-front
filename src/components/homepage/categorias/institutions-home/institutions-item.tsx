import { useContext, useEffect, useState } from 'react';
import { Alert } from '../../../ui/alert';
import { UserContext } from '../../../../context/context';
import { CardHeader, CardTitle } from '../../../ui/card';
import { getInstitutionImage } from './institution-image';
import { getInstitutionImageBackground } from './institution-image-background';
import {
  getFallbackInstitutionCover,
  getFallbackInstitutionLogo,
} from '../../../institution/fallback-logos';

type Institutions = {
  among: string;
  id: string;
  image: string;
  institution: string;
};

export function InstitutionsItem(props: Institutions) {
  const { valoresSelecionadosExport, searchType, itemsSelecionados } =
    useContext(UserContext);

  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchImage = async () => {
      const url = await getInstitutionImage(props.id);
      setImageUrl(url);
    };

    fetchImage();
  }, [props.id]);

  const [imageUrlBg, setImageUrlBg] = useState<string | null>(null);

  useEffect(() => {
    const fetchImage = async () => {
      const url = await getInstitutionImageBackground(props.id);
      setImageUrlBg(url);
    };

    fetchImage();
  }, [props.id]);

  // Fallback pequeno e removível quando o back retornar (tampa buraco do Firestore vazio)
  // Reusa src/components/institution/fallback-logos.ts - mesmo single-source de /instituicao
  const fallbackLogo = getFallbackInstitutionLogo({
    id: props.id,
    name: props.institution,
  });
  const fallbackCover = getFallbackInstitutionCover({
    id: props.id,
    name: props.institution,
  });

  // Resolve com fallback quando Firestore retorna null (ex: f1ac00a8... UFBA não encontrado) + preload para 404
  const [displayLogo, setDisplayLogo] = useState<string | null>(null);
  const [displayCover, setDisplayCover] = useState<string | null>(null);

  useEffect(() => {
    const target = imageUrl || fallbackLogo || null;
    if (!target) {
      setDisplayLogo(null);
      return;
    }
    if (target === fallbackLogo || !imageUrl) {
      setDisplayLogo(target);
      return;
    }
    const img = new Image();
    img.onload = () => setDisplayLogo(target);
    img.onerror = () => setDisplayLogo(fallbackLogo || null);
    img.src = target;
  }, [imageUrl, fallbackLogo]);

  useEffect(() => {
    const target = imageUrlBg || fallbackCover || null;
    if (!target) {
      setDisplayCover(null);
      return;
    }
    if (target === fallbackCover || !imageUrlBg) {
      setDisplayCover(target);
      return;
    }
    const img = new Image();
    img.onload = () => setDisplayCover(target);
    img.onerror = () => setDisplayCover(fallbackCover || null);
    img.src = target;
  }, [imageUrlBg, fallbackCover]);

  return (
    <div className="flex w-full group">
      <Alert className=" flex flex-col p-0 justify-between">
        <CardHeader className="flex p-0  justify-between space-y-0 pb-2">
          <div className="mb-3">
            <div>
              <Alert
                className="rounded-md border-0 border-b h-32 rounded-b-none bg-no-repeat bg-center bg-cover bg-neutral-100 dark:bg-neutral-100"
                style={{
                  backgroundImage: displayCover ? `url(${displayCover})` : undefined,
                  backgroundColor: displayCover ? undefined : '#f5f5f5',
                }}
              ></Alert>
              <div className="relative group w-fit -top-8 px-4">
                <Alert
                  className="aspect-square bg-no-repeat bg-center bg-contain rounded-md h-20 bg-white dark:bg-white border"
                  style={{
                    backgroundImage: displayLogo ? `url(${displayLogo})` : undefined,
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
