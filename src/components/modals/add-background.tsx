import { useModal } from '../hooks/use-modal-store';
import { Sheet, SheetContent } from '../../components/ui/sheet';
import { DialogHeader } from '../ui/dialog';

import { Check, Image, LoaderCircle, Plus, X } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import { ScrollArea } from '../ui/scroll-area';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { useCallback, useState } from 'react';
import { storage } from '../../lib/firebase';
import { v4 as uuidv4 } from 'uuid';

import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  getStorage,
} from 'firebase/storage';
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { useDropzone } from 'react-dropzone';
import { Textarea } from '../ui/textarea';
import { ColorPicker } from '../ui/color-picker';

export function AddBackground() {
  const { onClose, isOpen, type: typeModal, data } = useModal();
  const isModalOpen =
    (isOpen && typeModal === 'add-background') ||
    (isOpen && typeModal === 'edit-background');

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(false);
  const [progress, setProgress] = useState(0);

  const [titulo, setTitulo] = useState(data.titulo || '');
  const [descricao, setDescricao] = useState(data.descricao || '');
  const [botao, setBotao] = useState(data.botao || '');
  const [link, setLink] = useState(data.link || '');
  const [imgURL, setImgURL] = useState(data.imgURL || '');

  const [color, setColor] = useState(data.color || '#ffffff');
  const [textColor, setTextColor] = useState(data.textColor || '#000000');

  const [fileInfo, setFileInfo] = useState({ name: '', size: 0 });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    handleFileUpload(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleFileUpload = (files: File[]) => {
    const uploadedFile = files[0];
    if (uploadedFile) {
      setFileInfo({
        name: uploadedFile.name,
        size: uploadedFile.size,
      });
      setSelectedFile(uploadedFile);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!selectedFile) {
      toast('Por favor, selecione a imagem', {
        description: 'Nenhuma imagem selecionada',
        action: {
          label: 'Fechar',
          onClick: () => {},
        },
      });
      return;
    }

    if (!titulo.trim()) {
      toast('Informe um título para a imagem', {
        description: 'O título é obrigatório',
        action: {
          label: 'Fechar',
          onClick: () => {},
        },
      });
      return;
    }

    setUploadProgress(true);

    try {
      const storageRef = ref(storage, `images/${selectedFile.name}`);
      const uploadTask = uploadBytesResumable(storageRef, selectedFile);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(progress);
        },
        (error) => {
          console.error('Erro ao enviar imagem:', error);
          toast('Erro ao carregar imagem', {
            description: 'Tente novamente',
            action: {
              label: 'Fechar',
              onClick: () => {},
            },
          });
          setUploadProgress(false);
        },
        async () => {
          try {
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            setImgURL(url);

            const docId = uuidv4();
            const formData = {
              id: data.id || docId,
              titulo: titulo,
              descricao,
              botao,
              link,
              imgURL: url,
              color,
              textColor,
            };

            const db = getFirestore();
            const backgroundRef = collection(db, 'background_iapos');
            await addDoc(backgroundRef, formData);

            toast('Enviado com sucesso!', {
              description: 'Adicionado ao banco de dados',
              action: {
                label: 'Fechar',
                onClick: () => {},
              },
            });

            setUploadProgress(false);
            setTitulo('');
            setDescricao('');
            setBotao('');
            setLink('');
            setImgURL('');
            setColor('#ffffff');
            setTextColor('#000000');
            setProgress(0);
            onClose();
          } catch (error) {
            console.error('Erro ao salvar no Firestore:', error);
            setUploadProgress(false);

            toast('Erro ao salvar!', {
              description: 'Tente novamnete',
              action: {
                label: 'Fechar',
                onClick: () => {},
              },
            });
          }
        },
      );
    } catch (error) {
      console.error('Erro ao enviar os dados:', error);
      setUploadProgress(false);
    }
  };

  const updateImageData = async () => {
    try {
      const db = getFirestore();
      const storage = getStorage();
      const collectionName = 'background_iapos';
      const backgroundRef = collection(db, collectionName);

      // Busca o documento pelo campo 'id'
      const q = query(backgroundRef, where('id', '==', data.id || ''));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.error('Documento não encontrado!');
        toast('Erro ao atualizar!', {
          description: 'Documento não encontrado',
          action: {
            label: 'Fechar',
            onClick: () => {},
          },
        });
        return;
      }

      const docRef = querySnapshot.docs[0].ref;
      let newImgURL = imgURL; // Mantém o imgURL original, caso não haja um novo arquivo

      // Verifica se há um novo arquivo para upload
      if (selectedFile) {
        setUploadProgress(true);
        const storageRef = ref(storage, `images/${selectedFile.name}`);
        const uploadTask = uploadBytesResumable(storageRef, selectedFile);

        await new Promise<void>((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress =
                (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setProgress(progress);
            },
            (error) => {
              console.error('Erro ao enviar imagem:', error);
              toast('Erro ao carregar imagem', {
                description: 'Tente novamente',
                action: {
                  label: 'Fechar',
                  onClick: () => {},
                },
              });
              setUploadProgress(false);
              reject(error);
            },
            async () => {
              newImgURL = await getDownloadURL(uploadTask.snapshot.ref);
              setImgURL(newImgURL);
              setUploadProgress(false);
              resolve();
            },
          );
        });
      }

      // Atualiza o documento no Firestore
      await updateDoc(docRef, {
        titulo,
        descricao,
        botao,
        link,
        imgURL: newImgURL, // Usa a nova URL se a imagem foi atualizada
        color,
        textColor,
      });

      console.log('Documento atualizado com sucesso!');

      toast('Enviado com sucesso!', {
        description: 'Editado no banco de dados',
        action: {
          label: 'Fechar',
          onClick: () => {},
        },
      });

      onClose();
    } catch (error) {
      console.error('Erro ao atualizar o documento:', error);
      toast('Erro ao atualizar!', {
        description: 'Tente novamente',
        action: {
          label: 'Fechar',
          onClick: () => {},
        },
      });
    }
  };

  return (
    <Sheet open={isModalOpen} onOpenChange={onClose}>
      <SheetContent
        className={`p-0 dark:bg-neutral-900 dark:border-gray-600 min-w-[50vw]`}
      >
        <DialogHeader className="h-[50px] px-4 justify-center border-b dark:border-b-neutral-600">
          <div className="flex items-center gap-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className="h-8 w-8"
                    variant={'outline'}
                    onClick={() => onClose()}
                    size={'icon'}
                  >
                    <X size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent> Fechar</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="flex ml-auto items-center w-full justify-between">
              <div className="flex ml-auto items-center gap-3"></div>
            </div>
          </div>
        </DialogHeader>

        <div>
          <ScrollArea className="relative pb-4 whitespace-nowrap h-[calc(100vh-50px)] p-8 ">
            <div className="mb-8 flex justify-between items-center">
              <div>
                <p className="max-w-[750px] mb-2 text-lg font-light text-foreground">
                  Configurações
                </p>

                <h1 className="max-w-[500px] text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1] md:block">
                  {typeModal === 'add-background' ? 'Adicionar' : 'Editar'}{' '}
                  background
                </h1>
              </div>

              <div></div>
            </div>

            <div className="flex flex-col gap-6 w-full">
              <div className="flex gap-3 items-center w-full">
                <div className="grid items-center gap-1.5 w-full">
                  <Label>Nome da campanha*</Label>
                  <Input
                    type="text"
                    name="dep_nom"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid items-center gap-1.5 w-full">
                <Label>Descrição*</Label>
                <Textarea
                  name="dep_nom"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                />
              </div>

              <div className="flex gap-3 items-center w-full">
                <div className="grid items-center gap-1.5 w-full">
                  <Label>Nome do botão*</Label>
                  <Input
                    name="dep_nom"
                    value={botao}
                    onChange={(e) => setBotao(e.target.value)}
                  />
                </div>

                <div className="grid items-center gap-1.5 w-full">
                  <Label>Link*</Label>
                  <Input
                    name="dep_nom"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-3 items-center w-full">
                <div className="grid items-center gap-1.5 w-full">
                  <Label>Cor de fundo*</Label>
                  <div className="flex  gap-3">
                    <Input
                      type="text"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                    />

                    <ColorPicker
                      onChange={(v) => {
                        setColor(v);
                      }}
                      value={color || ''}
                    />
                  </div>
                </div>

                <div className="grid items-center gap-1.5 w-full">
                  <Label>Cor do texto*</Label>
                  <div className="flex  gap-3">
                    <Input
                      type="text"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                    />

                    <ColorPicker
                      onChange={(v) => {
                        setTextColor(v);
                      }}
                      value={textColor || ''}
                    />
                  </div>
                </div>
              </div>

              <div
                {...getRootProps()}
                className="border-dashed mb-3 flex-col border border-neutral-300 p-6 text-center rounded-md text-neutral-400 text-sm  cursor-pointer transition-all gap-3  w-full flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-800 "
              >
                <input {...getInputProps()} />
                <div className="p-4  border rounded-md">
                  <Image size={24} className=" whitespace-nowrap" />
                </div>
                {isDragActive ? (
                  <p>Solte os arquivos aqui ...</p>
                ) : (
                  <p>
                    Arraste e solte o arquivo .xls aqui ou clique para
                    selecionar o arquivo
                  </p>
                )}
              </div>

              <div>
                {fileInfo.name && (
                  <div className="justify-center flex items-center gap-3">
                    <Image size={16} />
                    <p className=" text-center  text-zinc-500 text-sm">
                      Arquivo selecionado: <strong>{fileInfo.name}</strong> (
                      {(fileInfo.size / 1024).toFixed(2)} KB)
                    </p>
                  </div>
                )}
              </div>
            </div>

            {typeModal == 'add-background' ? (
              <Button onClick={handleSubmit} className="mt-3 ml-auto flex ">
                {uploadProgress ? (
                  <LoaderCircle size={16} className="an animate-spin" />
                ) : (
                  <Plus size={16} className="" />
                )}{' '}
                {uploadProgress
                  ? 'Adicionando background'
                  : 'Adicionar background'}
              </Button>
            ) : (
              <Button
                onClick={() => updateImageData()}
                className="mt-3 ml-auto flex "
              >
                {uploadProgress ? (
                  <LoaderCircle size={16} className="an animate-spin" />
                ) : (
                  <Check size={16} className="" />
                )}{' '}
                {uploadProgress ? 'Editando background' : 'Editar background'}
              </Button>
            )}
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
