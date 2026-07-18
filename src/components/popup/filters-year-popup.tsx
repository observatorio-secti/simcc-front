import { useCallback, useEffect, useState, useRef } from "react";
import { Alert } from "../ui/alert";
import { CalendarBlank } from "phosphor-react";
import { Slider } from "../ui/slider";
import debounce from "lodash.debounce";
import { Filter } from "../../types";

interface Props {
    onFilterUpdate: (newFilter: Filter[]) => void;
}

export function FilterYearPopUp(props: Props) {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const [filterYear, setFilterYear] = useState([1990]);

    const isFirstRender = useRef(true);

    const debouncedUpdate = useCallback(
        debounce((newFilter: Filter[]) => {
            props.onFilterUpdate(newFilter);
        }, 500),
        [props.onFilterUpdate]
    );

    useEffect(() => {
        // Se for a primeira renderização, apenas mude a flag e não faça nada
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        // Apenas o ano é necessário aqui
        const newFilter = {
            year: filterYear,
        };
        debouncedUpdate([newFilter]);
    }, [filterYear, debouncedUpdate]);

    return (
        <div className=" flex gap-6">
            <div className="w-full flex flex-1 flex-col">
                <div className="flex items-center gap-3 mb-4 ">
                    <CalendarBlank size={24} className="text-gray-400" />
                    <p className="font-medium">Selecione o ano</p>
                </div>

                <Alert className="w-full flex items-center gap-2 h-[74px]">
                    <Slider
                        defaultValue={filterYear}
                        onValueChange={(value) => setFilterYear(value)}
                        max={currentYear}
                        min={1990}
                        step={1}
                        className="color-blue-700"
                    />
                    <p className="font-medium">{filterYear}</p>
                </Alert>
            </div>
        </div>
    );
}