import { useState } from 'react';
import { Rows, SquaresFour, UserList } from 'phosphor-react';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../../../../components/ui/accordion';
import { Button } from '../../../../ui/button';
import { Skeleton } from '../../../../ui/skeleton';
import { Research } from '../../../../../types/researcher';
import { HeaderResultTypeHome } from '../../header-result-type-home';
import { ResearchersBloco } from '../researchers-bloco';
import { TableReseracherhome } from '../table-reseracher-home';

interface ResearchersOpenAlexSectionProps {
  researchers: Research[];
  loading: boolean;
  isOpenAlex: boolean;
  finalOpenAlex: string;
}

export function ResearchersOpenAlexSection({
  researchers,
  loading,
  isOpenAlex,
  finalOpenAlex,
}: ResearchersOpenAlexSectionProps) {
  const [typeVisu, setTypeVisu] = useState<'block' | 'rows'>('block');

  if (!isOpenAlex || finalOpenAlex !== 'true') {
    return null;
  }

  const skeletons = Array.from({ length: 12 }, (_, index) => (
    <Skeleton key={index} className="w-full rounded-md h-[300px]" />
  ));

  return (
    <div>
      <Accordion defaultValue="item-1" type="single" collapsible>
        <AccordionItem value="item-1">
          <div className="flex mb-2">
            <HeaderResultTypeHome
              title="Pesquisador encontrado no OpenAlex"
              icon={<UserList size={24} className="text-gray-400" />}
            >
              <div className="flex gap-3 mr-3">
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
            <AccordionTrigger />
          </div>
          <AccordionContent>
            {typeVisu === 'block' ? (
              loading ? (
                <ResponsiveMasonry
                  columnsCountBreakPoints={{
                    350: 1,
                    750: 2,
                    900: 3,
                    1200: 4,
                  }}
                >
                  <Masonry gutter="16px">
                    {skeletons.map((item, index) => (
                      <div key={index}>{item}</div>
                    ))}
                  </Masonry>
                </ResponsiveMasonry>
              ) : (
                <ResearchersBloco researcher={researchers} />
              )
            ) : loading ? (
              <Skeleton className="w-full rounded-md h-[400px]" />
            ) : (
              <TableReseracherhome researcher={researchers} />
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
