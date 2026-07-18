import { CloudWordItemResearcher } from "./cloud-word-item-researcher";

type Research = {
    researcher: any[];
}

export function CloudWordResearcherHome(props: Research) {
    return (
        <div className="gap-2 flex-wrap flex w-full items-end">
            {props.researcher.slice(0, 10).map((item: any) => {
                const maxFontSize = 220;
                const minFontSize = 100;

                const distinctAmongValues = [...new Set(props.researcher.map((item: any) => item.among))];
                const distinctAmongCount = distinctAmongValues.length;
                const fontSize =
                    maxFontSize -
                    ((maxFontSize - minFontSize) / (distinctAmongCount )) *
                    distinctAmongValues.indexOf(item.among) ;

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
