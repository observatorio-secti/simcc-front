import { CloudWordItemResearcher } from './cloud-word-item-researcher';

type ResearcherItem = {
  id: string | number;
  name: string;
  frequency: number;
  among: number;
};


type Research = {
  researcher: any[];
};

export function CloudWordResearcherHome(props: Research) {
  const sortedResearcher = [...props.researcher].sort(
    (a, b) => b.among - a.among,
  );
  const distinctAmongValues = [
    ...new Set(sortedResearcher.map((item) => item.among)),
  ];
  const distinctAmongCount = distinctAmongValues.length;

  const maxFontSize = 220;
  const minFontSize = 100;

  return (
    <div className="gap-2 flex-wrap flex w-full items-end">
      {sortedResearcher.slice(0, 10).map((item) => {
        const rankIndex = distinctAmongValues.indexOf(item.among);
        const fontSize =
          distinctAmongCount <= 1
            ? maxFontSize
            : maxFontSize -
              ((maxFontSize - minFontSize) / (distinctAmongCount - 1)) *
                rankIndex;

        return (
          <CloudWordItemResearcher
            key={item.id}
            name={item.name}
            id={item.id}
            frequency={item.frequency}
            among={item.among}
            fontSize={fontSize}
          />
        );
      })}
    </div>
  );
}
