import { CloudWordItemResearcher } from './cloud-word-item-researcher';
import { Research } from '../../../../types/researcher';

type CloudWordResearcherHomeProps = {
  researcher: (Research | { id: string | number; name: string; frequency?: number; among: number })[];
};

const TOTAL_LEVELS = 6;
const MAX_FONT_SIZE = 180;
const MIN_FONT_SIZE = 60;
const STEP = (MAX_FONT_SIZE - MIN_FONT_SIZE) / (TOTAL_LEVELS - 1);

export function CloudWordResearcherHome(props: CloudWordResearcherHomeProps) {
  const sortedResearcher = [...props.researcher].sort(
    (a, b) => b.among - a.among,
  );
  const distinctAmongValues = [
    ...new Set(sortedResearcher.map((item) => item.among)),
  ];

  return (
    <div className="gap-2 flex-wrap flex w-full items-end">
      {sortedResearcher.slice(0, 10).map((item) => {
        const rankIndex = distinctAmongValues.indexOf(item.among);
        const level = Math.min(rankIndex, TOTAL_LEVELS - 1);
        const fontSize = MAX_FONT_SIZE - STEP * level;

        return (
          <CloudWordItemResearcher
            key={item.id}
            name={item.name}
            id={item.id}
            frequency={(item as any).frequency}
            among={item.among}
            fontSize={fontSize}
          />
        );
      })}
    </div>
  );
}
