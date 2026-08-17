import { ColumnDef } from '@tanstack/react-table';
import { Button } from '../../ui/button';
import { toast } from 'sonner';
import { doc, getDoc, getFirestore, setDoc } from 'firebase/firestore';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';

import { ArrowUpDown, Copy } from 'lucide-react';
import { Trash } from 'phosphor-react';
import { useModal } from '../../hooks/use-modal-store';
import { useContext, useEffect, useRef, useState } from 'react';
import { UserContext } from '../../../context/context';
import { EditInstitutionModal } from '../../modals/edit-institution-modal';

export interface PesquisadorProps {
  name: string;
  institution_id: string;
  acronym: string;
}

export const columnsInstitution: ColumnDef<PesquisadorProps>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Nome
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const lattes_id = row.original.name;

      const { urlGeral } = useContext(UserContext);
      return (
        <div className="flex gap-3 items-center">
          <div className="flex-1 flex">{row.getValue('name')}</div>
        </div>
      );
    },
  },

  {
    accessorKey: 'acronym',
    header: 'Sigla',
  },

  {
    id: 'actions',
    cell: ({ row }) => {
      const payment = row.original;
      const id_pesquisador = row.original.institution_id;
      const name = row.original.name;

      const { onOpen } = useModal();

      const [profile, setProfile] = useState({
        img_perfil: '',
        img_background: '',
        institution_id: '',
        color: '',
        site: '',
        name: '',
      });

      useEffect(() => {
        setProfile((prevProfile) => ({
          ...prevProfile,
          institution_id: row.original.institution_id || '', // Se não for array, pega direto
          name: row.original.name || '',
        }));
      }, [row.original]); // Atualiza sempre que `total` mudar

      const db = getFirestore();
      const storage = getStorage();
      const isDataLoaded = useRef(false); // Evita loops de salvamento

      // Carregar dados ao montar a página
      useEffect(() => {
        if (profile.institution_id) {
          const fetchInstitutionData = async () => {
            const docRef = doc(db, 'institutions', profile.institution_id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
              const data = docSnap.data();

              setProfile({
                institution_id: data?.institution_id || '',
                img_background: data?.img_background || '',
                img_perfil: data?.img_perfil || '',
                color: data?.color || '',
                site: data?.site || '',
                name: data?.name || '',
              });

              isDataLoaded.current = true; // Marca que os dados foram carregados
            } else {
              console.log(
                'Instituição não encontrada. Criando novo registro...',
              );
              await setDoc(docRef, {
                img_background: '',
                img_perfil: '',
                color: '',
                site: '',
                name: '',
              });
              isDataLoaded.current = true;
            }
          };

          fetchInstitutionData();
        }
      }, [profile.institution_id]);

      console.log('profile', profile);

      // Salvar automaticamente no Firebase quando os dados mudam
      useEffect(() => {
        if (profile.institution_id && isDataLoaded.current) {
          const saveData = async () => {
            await setDoc(
              doc(db, 'institutions', profile.institution_id),
              profile,
              { merge: true },
            );
          };
          saveData();
        }
      }, [profile]);

      // Função para upload de imagem
      const handleUpload = async (folder: 'perfil' | 'background') => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.click();

        fileInput.onchange = async (event) => {
          const file = (event.target as HTMLInputElement).files?.[0];
          if (!file || !profile.institution_id) return;

          const storagePath = `institutions/${profile.institution_id}/${folder}/${file.name}`;
          const storageRef = ref(storage, storagePath);

          toast.info('Enviando imagem...');
          await uploadBytes(storageRef, file);
          const downloadURL = await getDownloadURL(storageRef);

          setProfile((prev) => ({
            ...prev,
            img_background:
              folder === 'background' ? downloadURL : prev.img_background,
            img_perfil: folder === 'perfil' ? downloadURL : prev.img_perfil,
          }));

          await setDoc(
            doc(db, 'institutions', profile.institution_id),
            { [`img_${folder}`]: downloadURL },
            { merge: true },
          );

          toast.success('Upload concluído!');
        };
      };

      return (
        <div className="flex gap-3 justify-end">
          <Button
            onClick={() =>
              onOpen('confirm-delete-institution', {
                id_delete: id_pesquisador,
                name: name,
              })
            }
            variant={'destructive'}
            className="h-8 w-8 p-0 text-white  dark:text-white"
          >
            <Trash size={8} className="h-4 w-4" />
          </Button>

          <EditInstitutionModal
            profile={profile}
            setProfile={setProfile}
            name={row.original.name}
            institution_id={row.original.institution_id}
            acronym={row.original.acronym}
          />

          <Button
            onClick={() => {
              navigator.clipboard.writeText(payment.institution_id);

              toast('Operação realizada', {
                description:
                  'Id da instituição copiado para área de transferência',
                action: {
                  label: 'Fechar',
                  onClick: () => {},
                },
              });
            }}
            variant={'outline'}
            className="h-8 w-8 p-0 "
          >
            <Copy size={16} />
          </Button>
        </div>
      );
    },
  },
];
