import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { query, where } from 'firebase/firestore';
import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../context/context';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';

interface Csv {
  great_area: string;
  term: string;
  frequency: string;
  type_: string;
  term_normalize: string;
}

export function HeaderResult() {

  const db = getFirestore();
  const { searchType, itemsSelecionados, setItensSelecionados } = useContext(UserContext);
  const [filteredItems, setFilteredItems] = useState<Csv[]>([]);
  const [loading, setLoading] = useState(true); // Adiciona um estado de carregamento

  const searchFilesByTermPrefix = async (prefix: string) => {
    try {
      const search = searchType?.toUpperCase() || 'ARTICLE';

      const filesRef = collection(db, import.meta.env.VITE_BANCO_FIREBASE_SEARCH);
      const q = query(
        filesRef,
        where('term_normalize', '>=', prefix),
        where('term_normalize', '<=', prefix + '\uf8ff')
      );

      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        console.warn('No matching documents.');
        return [];
      }

      const files = querySnapshot.docs.map((doc) => doc.data() as Csv);

      const mappedFiles = files.filter((file) => file.type_ === search);

      return mappedFiles;
    } catch (error) {
      console.error('Erro ao buscar arquivos:', error);
      return [];
    }
  };

  const normalizeInput = (value: string): string => {
    value = value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    value = value.toLowerCase();
    value = value.replace(/[()|;]/g, '');
    value = value.replace(/[^a-z0-9]/g, '');
    return value;
  };

  const [type, setType] = useState('')

  useEffect(() => {
    switch (searchType) {
      case 'article':
        return setType('ARTICLE')
      case 'abstract':
        return setType('ABSTRACT')
      case 'patent':
        return setType('PATENT')
      case 'book':
        return setType('BOOK')
      case 'speaker':
        return setType('SPEAKER')
      case 'area':
        return setType('AREA')
      case 'name':
        return setType('NAME')

    }
  }, []);

  useEffect(() => {
    const fetchFilteredItems = async () => {
      setFilteredItems([])
      let allResults: Csv[] = [];

      for (const item of itemsSelecionados) {
        const normalizedValue = normalizeInput(item.term);
        const prefix = normalizedValue.slice(0, 3);
        console.log(prefix)
        const results = await searchFilesByTermPrefix(prefix);
        allResults = [...allResults, ...results.slice(0, 6)];
      }

      // Filtra os itens selecionados
      const filtered = allResults
        .filter((result) => !itemsSelecionados.some((item) => normalizeInput(item.term) === result.term_normalize))
      // Limitar a 5 resultados

      setFilteredItems(filtered);
    };

    fetchFilteredItems();
  }, [itemsSelecionados, searchType]);



  return (
    <div>
      {filteredItems.length > 0 && (
        <div className="grid grid-cols-1 mt-8">
          <ScrollArea>
            <div className="flex items-center justify-between">
              <div className="flex gap-3 items-center">
                <div>
                  <div className="flex flex-wrap gap-3 items-center">
                    <p className="text-sm font-medium">Sugestões:</p>
                    {Array.from(
                      new Map(
                        filteredItems.map((item) => [item.term_normalize || item.term, item])
                      ).values()
                    ).map((props, index) => (
                      <div
                        key={index}
                        onClick={() => {
                          setItensSelecionados([{ term: props.term_normalize }]);
                        }}
                        className="flex whitespace-nowrap gap-2 h-8 capitalize cursor-pointer transition-all bg-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-900 dark:bg-neutral-800 items-center p-2 px-3 rounded-md text-xs"
                      >
                        {props.term || props.term_normalize}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <ScrollBar className="pb-4 md:pb-0 md:hidden" orientation="horizontal" />
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
