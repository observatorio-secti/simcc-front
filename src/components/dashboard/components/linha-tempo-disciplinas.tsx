import { Check, X } from "lucide-react";
import { ScrollArea, ScrollBar } from "../../ui/scroll-area";
import { useModal } from "../../hooks/use-modal-store";

interface YearSemester {
  year: string;
  semester: string;
}

interface Item extends YearSemester {
  selected?: boolean;
}

interface Props {
  items: Item[];
  depId: string;
}

export function LinhaTempoDisciplinas({ items, depId }: Props) {
  const { onOpen } = useModal();

  console.log(depId);
  return (
    <ScrollArea className=" relative pb-4 whitespace-nowrap">
      <div className="flex items-center">
        {items.map((item, index) => (
          <div>
            <div key={index} className="flex w-20 flex-col items-center gap-3 z-[1]">
              <div className="flex items-center w-full">
                <div className="border-b w-full  flex flex-1  "></div>

                <div
                  onClick={() => onOpen("import-disciplina", { dep_id: depId })}
                  className={`w-8 h-8 cursor-pointer rounded-full border ${
                    item.selected
                      ? "bg-eng-dark-blue dark:bg-eng-dark-blue text-white"
                      : "bg-neutral-50 dark:bg-neutral-900"
                  } whitespace-nowrap flex items-center justify-center text-xl font-bold`}
                >
                  {item.selected ? <Check size={12} /> : <X size={12} />}
                </div>

                <div className="border-b w-full relative  flex flex-1  "></div>
              </div>
              <p className="text-xs text-center font-medium max-w-20">
                {item.year}/{item.semester}
              </p>
            </div>
          </div>
        ))}
      </div>

      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}