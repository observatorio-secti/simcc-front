import { Building2, Plus } from 'lucide-react';
import { Alert } from '../../ui/alert';
import { Button } from '../../ui/button';
import { v4 as uuidv4 } from 'uuid';
import bg_popup from '../../../assets/bg_popup.png';
import { CardContent, CardHeader, CardTitle } from '../../ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../ui/accordion';
import { HeaderResultTypeHome } from '../../homepage/categorias/header-result-type-home';
import { Buildings, MagnifyingGlass, Rows, SquaresFour } from 'phosphor-react';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
import { Skeleton } from '../../ui/skeleton';
import { useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { DataTable } from '../data-table';
import { UserContext } from '../../../context/context';
import { columnsInstitution } from './columns-institutions';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { useModal } from '../../hooks/use-modal-store';
import { InstitutionItem } from './institution-item';

export interface Props {
  name: string;
  institution_id: string;
  acronym: string;
  lattes_id: string;
}

export function Instituicoes() {
  const [loading, setLoading] = useState(false);
  const { user, urlGeralAdm, permission } = useContext(UserContext);

  const [nome, setNome] = useState('');
  const [sigla, setSigla] = useState('');
  const [lattesId, setLattesId] = useState('');

  const [count, setCount] = useState(24);

  const [typeVisu, setTypeVisu] = useState('block');

  const [researcher, setResearcher] = useState<Props[]>([]);

  const items = Array.from({ length: 12 }, (_, index) => (
    <Skeleton key={index} className="w-full rounded-md h-[200px]" />
  ));

  const handleSubmitPesquisador = async () => {
    const docId = uuidv4();

    try {
      const data = [
        {
          institution_id: docId,
          name: nome,
          acronym: sigla,
        },
      ];

      console.log(data);

      const urlProgram = urlGeralAdm + '/InstitutionRest/Insert';

      const fetchData = async () => {
        if (sigla.length != 0 && nome.length != 0) {
          try {
            const response = await fetch(urlProgram, {
              mode: 'cors',
              method: 'POST',
              headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '3600',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(data),
            });

            if (response.ok) {
              setLattesId('');
              setSigla('');
              setNome('');
              fetchDataTable();
              toast('Dados enviados com sucesso', {
                description: 'Instituição cadastrada na plataforma',
                action: {
                  label: 'Fechar',
                  onClick: () => {},
                },
              });
            } else {
              if (response.status === 400) {
                toast('Instituição já existe', {
                  description: 'Tente novamente',
                  action: {
                    label: 'Fechar',
                    onClick: () => {},
                  },
                });
              } else {
                toast('Erro ao enviar os dados ao servidor', {
                  description: 'Tente novamente',
                  action: {
                    label: 'Fechar',
                    onClick: () => {},
                  },
                });
              }
            }
          } catch (err) {
            console.log(err);
          }
        } else {
          if (sigla.length == 0) {
            toast('Preencha o acronônimo da instituição', {
              description: 'Parece que o campo está vazio',
              action: {
                label: 'Fechar',
                onClick: () => {},
              },
            });
          } else if (nome.length == 0) {
            toast('Preencha o nome da instituição', {
              description: 'Parece que o campo está vazio',
              action: {
                label: 'Fechar',
                onClick: () => {},
              },
            });
          }
        }
      };
      fetchData();
      fetchDataTable();
    } catch (error) {
      console.error('Erro ao processar a requisição:', error);
    }
  };

  // upload

  const urlGetResearcher = urlGeralAdm + `InstitutionRest/Query`;
  const { onOpen } = useModal();

  const fetchDataTable = async () => {
    setLoading(true);
    try {
      const response = await fetch(urlGetResearcher, {
        mode: 'cors',
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '3600',
          'Content-Type': 'text/plain',
        },
      });
      const data = await response.json();
      if (data) {
        setResearcher(data);
        setLoading(false);
      }
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDataTable();
  }, [urlGetResearcher]);

  console.log(researcher);

  const [add, setAdd] = useState(false);

  const [search, setSearch] = useState('');
  const filteredTotal = Array.isArray(researcher)
    ? researcher.filter((item) => {
        const normalizeString = (str) =>
          str.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

        const searchString = normalizeString(item.name);
        const normalizedSearch = normalizeString(search);

        return searchString.includes(normalizedSearch);
      })
    : [];

  return (
    <div className="px-8 flex flex-col gap-8">
      <div className="gap-4 md:gap-8 flex flex-col ">
        <Alert className="h-14  p-2 flex items-center justify-between  w-full">
          <div className="flex items-center gap-2 w-full flex-1">
            <MagnifyingGlass size={16} className=" whitespace-nowrap w-10" />
            <Input
              onChange={(e) => setSearch(e.target.value)}
              value={search}
              type="text"
              className="border-0 w-full "
            />
          </div>
        </Alert>

        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <Alert
            className="p-0 bg-cover bg-no-repeat bg-center lg:col-span-3"
            style={{ backgroundImage: `url(${bg_popup})` }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de instituições
              </CardTitle>
              <Buildings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{researcher.length}</div>
              <p className="text-xs text-muted-foreground">registrados</p>
            </CardContent>
          </Alert>

          <Alert
            onClick={() => setAdd(!add)}
            className="p-0 hover:bg-eng-dark-blue bg-eng-blue dark:hover:bg-eng-dark-blue dark:bg-eng-blue text-white transition-all cursor-pointer "
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium"></CardTitle>
              <Plus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>

            <CardContent>
              <h2 className="font-medium text-xl">
                Adicionar <br /> instituição
              </h2>
            </CardContent>
          </Alert>
        </div>
      </div>

      {add && (
        <fieldset className="grid gap-6 rounded-lg  p-4 bg-white dark:border-neutral-800 border border-neutral-200 dark:bg-neutral-950 bg-cover  bg-center bg-no-repeat ">
          <legend className="-ml-1 px-1 text-sm font-medium">
            Adicionar instituição
          </legend>

          <div className="flex gap-3 items-end">
            <div className="flex flex-col space-y-1.5 w-full flex-1">
              <Label htmlFor="name">Nome da instituição</Label>
              <Input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                type="text"
              />
            </div>

            <div className="flex flex-col space-y-1.5 w-full flex-1">
              <Label htmlFor="name">Sigla</Label>
              <Input
                value={sigla}
                onChange={(e) => setSigla(e.target.value)}
                type="text"
              />
            </div>

            <Button
              onClick={() => handleSubmitPesquisador()}
              className="text-white dark:text-white"
            >
              <Plus size={16} className="" /> Adicionar
            </Button>
          </div>
        </fieldset>
      )}

      <Accordion defaultValue="item-1" type="single" collapsible>
        <AccordionItem value="item-1">
          <div className="flex mb-2">
            <HeaderResultTypeHome
              title="Todas as instituições"
              icon={<Building2 size={24} className="text-gray-400" />}
            >
              <div className="hidden md:flex gap-3 mr-3">
                <Button
                  onClick={() => setTypeVisu('rows')}
                  variant={typeVisu === 'block' ? 'ghost' : 'outline'}
                  size={'icon'}
                >
                  <Rows size={16} className="whitespace-nowrap" />
                </Button>
                <Button
                  onClick={() => setTypeVisu('block')}
                  variant={typeVisu === 'block' ? 'outline' : 'ghost'}
                  size={'icon'}
                >
                  <SquaresFour size={16} className="whitespace-nowrap" />
                </Button>
              </div>
            </HeaderResultTypeHome>
            <AccordionTrigger></AccordionTrigger>
          </div>
          <AccordionContent>
            {typeVisu === 'block' ? (
              loading ? (
                <ResponsiveMasonry
                  columnsCountBreakPoints={{
                    350: 1,
                    750: 1,
                    900: 2,
                    1200: 3,
                    1500: 4,
                    1700: 4,
                  }}
                >
                  <Masonry gutter="16px">
                    {items.map((item, index) => (
                      <div key={index}>{item}</div>
                    ))}
                  </Masonry>
                </ResponsiveMasonry>
              ) : (
                <div>
                  <ResponsiveMasonry
                    columnsCountBreakPoints={{
                      350: 1,
                      750: 1,
                      900: 2,
                      1200: 3,
                      1500: 4,
                      1700: 4,
                    }}
                  >
                    <Masonry gutter="16px">
                      {filteredTotal.slice(0, count).map((item: any) => {
                        return (
                          <InstitutionItem
                            name={item.name}
                            institution_id={item.institution_id}
                            acronym={item.acronym}
                          />
                        );
                      })}
                    </Masonry>
                  </ResponsiveMasonry>

                  {filteredTotal.length > count && (
                    <div className="w-full flex justify-center mt-8">
                      <Button onClick={() => setCount(count + 24)}>
                        <Plus size={16} />
                        Mostrar mais
                      </Button>
                    </div>
                  )}
                </div>
              )
            ) : loading ? (
              <Skeleton className="w-full rounded-md h-[400px]" />
            ) : (
              <DataTable columns={columnsInstitution} data={filteredTotal} />
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
