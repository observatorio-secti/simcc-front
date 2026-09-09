import { useCallback, useEffect, useState, useRef } from 'react';
import { CalendarBlank } from 'phosphor-react';
import { Calendar, ChevronDown } from 'lucide-react';
import debounce from 'lodash.debounce';
import { Filter } from '../../types';

interface Props {
  onFilterUpdate: (newFilter: Filter[]) => void;
}

export function FilterYearPopUp(props: Props) {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  
  const availableYears = [];
  // Trava o limite da lista visual em 1990 para não criar um menu gigante
  for (let y = currentYear; y >= 1990; y--) {
    availableYears.push(y);
  }

  // Inicia com 'all' para puxar o histórico completo (mesmo os anos antes de 1990)
  const [selectedYear, setSelectedYear] = useState<string | number>('all');
  const isFirstRender = useRef(true);

  const debouncedUpdate = useCallback(
    debounce((newFilter: Filter[]) => {
      props.onFilterUpdate(newFilter);
    }, 300),
    [props.onFilterUpdate],
  );

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Se "Todos os anos", envia [] e a API traz tudo (ex: 1973). Se número, envia [ano].
    const yearPayload = selectedYear === 'all' ? [] : [Number(selectedYear)];
    
    const newFilter = {
      year: yearPayload,
    };
    debouncedUpdate([newFilter]);
  }, [selectedYear, debouncedUpdate]);

  return (
    <div className="flex gap-6 w-full">
      <div className="w-full flex flex-1 flex-col">
        <div className="flex items-center gap-3 mb-4">
          <CalendarBlank size={24} className="text-gray-400" />
          <p className="font-medium">Selecione o ano</p>
        </div>

        <div className="w-full flex items-center h-[50px]">
          <div className="relative inline-flex items-center group w-full max-w-[280px]">
            <Calendar className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none z-10" />
            
            <select
              className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-eng-blue/20 appearance-none cursor-pointer transition-all relative z-0"
              value={selectedYear} 
              onChange={(e) => {
                const val = e.target.value;
                setSelectedYear(val === 'all' ? 'all' : parseInt(val, 10));
              }}
            >
              <option value="all">Todos os anos</option>
              {availableYears.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>

            <ChevronDown className="absolute right-3.5 w-4 h-4 text-slate-400 pointer-events-none z-10" />
          </div>
        </div>
      </div>
    </div>
  );
}