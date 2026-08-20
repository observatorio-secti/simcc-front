import { Maximize2, Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { useModalSecundary } from '../hooks/use-modal-store-secundary';
import { useContext, useEffect, useRef, useState } from 'react';
import { UserContext } from '../../context/context';
import { Alert } from '../ui/alert';
import { useModal } from '../hooks/use-modal-store';
import { Skeleton } from '../ui/skeleton';

interface Props {
  id: string;
  name: string;
}

interface Coautor {
  id: string;
  name: string;
  among: number;
  type: string;
}

export function Coautores(props: Props) {
  const { onOpen } = useModalSecundary();
  const { onOpen: onOpenOne, onClose } = useModal();
  const [count, setCount] = useState(5);
  const [researcher, setResearcher] = useState<Coautor[]>([]);
  const [loading, isLoading] = useState(false);
  const { urlGeral } = useContext(UserContext);
  const urlTermPesquisadores =
    urlGeral + `researcher/co-authorship/${props.id}`;
  console.log(urlTermPesquisadores);

  useEffect(() => {
    const fetchData = async () => {
      try {
        isLoading(true);
        const response = await fetch(urlTermPesquisadores, {
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
        }
      } catch (err) {
        console.log(err);
      } finally {
        isLoading(false);
      }
    };
    fetchData();
  }, [urlTermPesquisadores]);

  const containerRef = useRef<HTMLDivElement>(null);
  const [maxFontSize, setMaxFontSize] = useState(100);

  useEffect(() => {
    if (containerRef.current) {
      const containerHeight = containerRef.current.clientHeight;
      setMaxFontSize(containerHeight * 0.2); // Define um tamanho máximo baseado na altura da div pai
    }
  }, [researcher]);

  const minFontSize = maxFontSize * 0.6;
  // Ordena os pesquisadores em ordem decrescente pelo valor de among
  const sortedResearchers = [...researcher].sort((a, b) => b.among - a.among);

  const maxAmong = Math.max(...sortedResearchers.map((item) => item.among), 1);
  const minAmong = Math.min(...sortedResearchers.map((item) => item.among), 1);

  return (
    <div>
      <div className="flex mb-6 items-center justify-between">
        <div className="text-left  font-medium text-2xl">Coautores</div>

        <Button
          onClick={() =>
            onOpen('coautores', { id: props.id, name: props.name })
          }
          className="w-8 h-8"
          size={'icon'}
          variant={'outline'}
        >
          <Maximize2 size={16} />
        </Button>
      </div>
      <div className="flex flex-wrap gap-4">
        <div className="flex gap-1 items-center">
          <div className="w-4 h-4 rounded-md bg-yellow-500"></div>
          <p className="text-sm text-gray-500">Mesma instituição</p>
        </div>

        <div className="flex gap-1 items-center">
          <div className="w-4 h-4 rounded-md bg-orange-400"></div>
          <p className="text-sm text-gray-500">Externo</p>
        </div>

        <div className="flex gap-1 items-center">
          <div className="w-4 h-4 rounded-md bg-red-400"></div>
          <p className="text-sm text-gray-500">Não identificado</p>
        </div>
      </div>

      {loading ? (
        <div className="flex gap-2 my-6 flex-wrap">
          <Skeleton className="rounded-md  w-full h-[50px]" />
          <Skeleton className="rounded-md w-[70%] h-[40px]" />
          <Skeleton className="rounded-md  w-[85%] h-[35px]" />
          <Skeleton className="rounded-md  w-[40%] h-[25px]" />
        </div>
      ) : (
        <div className="gap-2 my-6 flex-wrap flex w-full items-start ">
          {sortedResearchers.slice(0, count).map((item) => {
            const maxFontSize = 130;
            const minFontSize = 70;

            const distinctAmongValues = [
              ...new Set(sortedResearchers.map((item: any) => item.among)),
            ];
            const distinctAmongCount = distinctAmongValues.length;
            const fontSize =
              maxFontSize -
              ((maxFontSize - minFontSize) / (distinctAmongCount - 1)) *
                distinctAmongValues.indexOf(item.among);

            return (
              <li key={item.id} className="list-none">
                <div className="text-left">
                  <Alert
                    className={`flex items-start justify-start text-left w-fit gap-2 font-semibold text-white  p-2 
                    ${
                      (item.type === 'internal' &&
                        'bg-yellow-500 dark:bg-yellow-500') ||
                      (item.type === 'external' &&
                        'bg-orange-400 dark:bg-orange-400') ||
                      (item.type === 'speaker' &&
                        'bg-red-400 dark:bg-red-400') ||
                      ''
                    }
                  `}
                    style={{
                      fontSize: `${fontSize}%`,
                      maxWidth: '100%',
                      whiteSpace: 'normal',
                      wordBreak: 'break-word',
                      textAlign: 'center',
                    }}
                  >
                    <p className="text-left">
                      {item.name}{' '}
                      <strong className="font-normal">{item.among}</strong>
                    </p>
                  </Alert>
                </div>
              </li>
            );
          })}
        </div>
      )}

      {sortedResearchers.length > count && (
        <div className="w-full mb-6 items-center flex justify-center">
          <Button
            onClick={() => setCount(count + 5)}
            variant={'outline'}
            size={'sm'}
          >
            <Plus size={16} /> Mostrar mais
          </Button>
        </div>
      )}
    </div>
  );
}
