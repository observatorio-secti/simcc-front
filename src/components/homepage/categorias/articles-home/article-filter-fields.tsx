import { useEffect, useState } from "react";
import { Alert } from "../../../ui/alert";
import { Input } from "../../../ui/input";
import { CalendarBlank, CheckSquare } from "phosphor-react";
import { Slider } from "../../../ui/slider";

export const ABSOLUTE_YEAR_MIN = 1990;

export function getYearBounds() {
    const max = new Date().getFullYear();
    return { min: ABSOLUTE_YEAR_MIN, max, defaultMin: max - 10, defaultMax: max };
}

export function getDefaultYearRange(): [number, number] {
    const { defaultMin, defaultMax } = getYearBounds();
    return [defaultMin, defaultMax];
}

export function normalizeYearRange(value: number[] | undefined): [number, number] {
    const { min: YEAR_MIN, max: YEAR_MAX } = getYearBounds();
    if (!value || value.length === 0) return getDefaultYearRange();
    if (value.length === 1) {
        const clamped = Math.min(Math.max(value[0], YEAR_MIN), YEAR_MAX);
        return [clamped, YEAR_MAX];
    }
    const a = Math.min(Math.max(value[0], YEAR_MIN), YEAR_MAX);
    const b = Math.min(Math.max(value[1], YEAR_MIN), YEAR_MAX);
    return a <= b ? [a, b] : [b, b];
}

export function yearRangeToString(range: number[] | undefined): string {
    const [min] = normalizeYearRange(range);
    return String(min);
}

export function yearRangeToStringExpanded(range: number[] | undefined): string {
    const [min, max] = normalizeYearRange(range);
    const years: number[] = [];
    for (let y = min; y <= max; y++) years.push(y);
    return years.join(";");
}

export function yearRangeToStringInterval(range: number[] | undefined): string {
    const [min, max] = normalizeYearRange(range);
    if (min === max) return String(min);
    return `${min};${max}`;
}

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
    const { min: YEAR_MIN, max: YEAR_MAX } = getYearBounds();
    const normalized = normalizeYearRange(value);
    const [minStr, setMinStr] = useState(String(normalized[0]));
    const [maxStr, setMaxStr] = useState(String(normalized[1]));

    useEffect(() => {
        setMinStr(String(normalized[0]));
        setMaxStr(String(normalized[1]));
    }, [normalized[0], normalized[1]]);

    const commitMin = (raw: string) => {
        const parsed = parseInt(raw, 10);
        if (Number.isNaN(parsed)) {
            setMinStr(String(normalized[0]));
            return;
        }
        let clamped = Math.min(Math.max(parsed, YEAR_MIN), YEAR_MAX);
        if (clamped > normalized[1]) clamped = normalized[1];
        onChange([clamped, normalized[1]]);
    };

    const commitMax = (raw: string) => {
        const parsed = parseInt(raw, 10);
        if (Number.isNaN(parsed)) {
            setMaxStr(String(normalized[1]));
            return;
        }
        let clamped = Math.min(Math.max(parsed, YEAR_MIN), YEAR_MAX);
        if (clamped < normalized[0]) clamped = normalized[0];
        onChange([normalized[0], clamped]);
    };

    const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;
        setMinStr(raw);
        if (raw === "" || raw === "-") return;
        const parsed = parseInt(raw, 10);
        if (Number.isNaN(parsed)) return;
        if (parsed < YEAR_MIN || parsed > YEAR_MAX) return;
        if (parsed > normalized[1]) return;
        onChange([parsed, normalized[1]]);
    };

    const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;
        setMaxStr(raw);
        if (raw === "" || raw === "-") return;
        const parsed = parseInt(raw, 10);
        if (Number.isNaN(parsed)) return;
        if (parsed < YEAR_MIN || parsed > YEAR_MAX) return;
        if (parsed < normalized[0]) return;
        onChange([normalized[0], parsed]);
    };

    return (
        <Alert className="w-full flex flex-col gap-3">
            <Slider
                value={normalized}
                onValueChange={(v) => {
                    const [a, b] = v as [number, number];
                    const clampedA = Math.min(Math.max(a, YEAR_MIN), YEAR_MAX);
                    const clampedB = Math.min(Math.max(b, YEAR_MIN), YEAR_MAX);
                    onChange(clampedA <= clampedB ? [clampedA, clampedB] : [clampedB, clampedB]);
                }}
                max={YEAR_MAX}
                min={YEAR_MIN}
                step={1}
                className="color-blue-700"
            />
            <div className="flex items-center gap-2">
                <Input
                    type="number"
                    inputMode="numeric"
                    aria-label="Ano mínimo"
                    value={minStr}
                    min={YEAR_MIN}
                    max={YEAR_MAX}
                    onChange={handleMinChange}
                    onBlur={() => commitMin(minStr)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                    }}
                    className="h-9 text-center"
                />
                <span className="text-sm text-muted-foreground shrink-0">—</span>
                <Input
                    type="number"
                    inputMode="numeric"
                    aria-label="Ano máximo"
                    value={maxStr}
                    min={YEAR_MIN}
                    max={YEAR_MAX}
                    onChange={handleMaxChange}
                    onBlur={() => commitMax(maxStr)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                    }}
                    className="h-9 text-center"
                />
            </div>
            <p className="text-sm font-bold text-center">{normalized[0]} — {normalized[1]}</p>
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