import { Alert } from "../../../ui/alert";
import { CalendarBlank, CheckSquare } from "phosphor-react";
import { Slider } from "../../../ui/slider";

export const qualisColor: { [key: string]: string } = {
    A1: "bg-[#006837]",
    A2: "bg-[#8FC53E]",
    A3: "bg-[#ACC483]",
    A4: "bg-[#BDC4B1]",
    B1: "bg-[#F15A24]",
    B2: "bg-[#F5831F]",
    B3: "bg-[#F4AD78]",
    B4: "bg-[#F4A992]",
    C: "bg-[#EC1C22]",
    SQ: "bg-[#560B11]",
    NP: "bg-[#560B11]",
};

export const qualisOptions = [
    { id: 1, itens: "A1" },
    { id: 2, itens: "A2" },
    { id: 3, itens: "A3" },
    { id: 4, itens: "A4" },
    { id: 5, itens: "B1" },
    { id: 6, itens: "B2" },
    { id: 7, itens: "B3" },
    { id: 8, itens: "B4" },
    { id: 10, itens: "C" },
    { id: 11, itens: "SQ" },
];

export function ArticleQualisSelector({ selected, onToggle }: { selected: string[]; onToggle: (itemId: number, isChecked: boolean) => void }) {
    return (
        <div className="gap-4 flex flex-wrap">
            {qualisOptions.map((quali) => {
                const isChecked = selected.includes(quali.itens);
                return (
                    <li
                        key={quali.id}
                        className="checkboxLabel group list-none inline-flex group overflow-hidden"
                        onMouseDown={(e) => e.preventDefault()}
                    >
                        <label
                            className={`cursor-pointer gap-3 transition-all flex h-10 items-center px-4 rounded-md text-xs font-medium hover:bg-gray-100 dark:hover:bg-neutral-800 ${isChecked ? "bg-neutral-100 dark:bg-neutral-800" : ""
                                }`}
                        >
                            <div className={`rounded-sm h-4 w-4 ${qualisColor[quali.itens]}`}></div>
                            <span className="text-center block">{quali.itens}</span>
                            <input
                                type="checkbox"
                                className="absolute hidden group"
                                onChange={(e) => onToggle(quali.id, e.target.checked)}
                                id={quali.itens}
                                checked={isChecked}
                            />
                        </label>
                    </li>
                );
            })}
        </div>
    );
}

export function ArticleYearSlider({ value, onChange }: { value: number[]; onChange: (value: number[]) => void }) {
    const currentDate = new Date();
    const year = currentDate.getFullYear();

    return (
        <Alert className="w-full flex items-center gap-2 h-full">
            <Slider
                value={value}
                onValueChange={onChange}
                max={year}
                min={1990}
                step={1}
                className="color-blue-700"
            ></Slider>
            <p className="text-sm font-bold">{value}</p>
        </Alert>
    );
}

export function ArticleFilterSections({ qualis, year, onQualisChange, onYearChange }: { qualis: string[]; year: number[]; onQualisChange: (qualis: string[]) => void; onYearChange: (year: number[]) => void }) {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                    <CheckSquare size={24} className="text-gray-400" />
                    <p className=" font-medium">Selecione o Qualis</p>
                </div>
                <Alert className="w-fit">
                    <ArticleQualisSelector
                        selected={qualis}
                        onToggle={(itemId, isChecked) => {
                            const item = qualisOptions.find((q) => q.id === itemId);
                            if (!item) return;
                            onQualisChange(
                                isChecked
                                    ? [...qualis, item.itens]
                                    : qualis.filter((it) => it !== item.itens)
                            );
                        }}
                    />
                </Alert>
            </div>

            <div className="w-full flex flex-1 flex-col">
                <div className="flex items-center gap-3 mb-4">
                    <CalendarBlank size={24} className="text-gray-400" />
                    <p className=" font-medium">Selecione o ano</p>
                </div>

                <ArticleYearSlider value={year} onChange={onYearChange} />
            </div>
        </div>
    );
}