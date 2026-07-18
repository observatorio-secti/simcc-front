import  { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../ui/select';

interface Disciplinas {
  semester: string;
  academic_activity_code: string;
  academic_activity_name: string;
  available_slots: number;
  occupied_slots: number;
  academic_activity_ch: number;
  professor: string;
  schedule: string;
}




export function GraficoDisciplinas({ disciplinas }: { disciplinas: Disciplinas[] }) {
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('');
  const [selectedProfessor, setSelectedProfessor] = useState<string>('');
  const [filteredData, setFilteredData] = useState<Disciplinas[]>([]);
  const [chartData, setChartData] = useState<{ semester: string; hours: number }[]>([]);

  useEffect(() => {
    // Filtrar dados com base na disciplina e professor selecionados
    const filtered = disciplinas.filter(d => 
      (selectedDiscipline ? d.academic_activity_name === selectedDiscipline : true) &&
      (selectedProfessor ? d.professor === selectedProfessor : true) &&
      d.occupied_slots > 0
    );
    setFilteredData(filtered);

    const professorHours: { [key: string]: { [key: string]: number } } = {};

    // Inicializar o cálculo das horas por professor por semestre
    filtered.forEach(disciplina => {
      const weeklyHours = disciplina.academic_activity_ch / 15;
      if (!professorHours[disciplina.semester]) {
        professorHours[disciplina.semester] = {};
      }
      if (!professorHours[disciplina.semester][disciplina.professor]) {
        professorHours[disciplina.semester][disciplina.professor] = 0;
      }
      professorHours[disciplina.semester][disciplina.professor] += weeklyHours;
    });

    const aggregatedData = Object.keys(professorHours).map(semester => ({
      semester,
      hours: Object.values(professorHours[semester]).reduce((sum, hours) => sum + hours, 0)
    }));

    setChartData(aggregatedData);
  }, [selectedDiscipline, selectedProfessor, disciplinas]);

  const uniqueDisciplines = [...new Set(disciplinas.map(d => d.academic_activity_name))];
  const uniqueProfessors = [...new Set(disciplinas.map(d => d.professor))];

  return (
    <div className="grid gap-3 w-full">
      <Select value={selectedDiscipline} onValueChange={setSelectedDiscipline}>
        <SelectTrigger className="">
          <SelectValue placeholder="Selecione a disciplina" />
        </SelectTrigger>
        <SelectContent>
          {uniqueDisciplines.map((discipline) => (
            <SelectItem key={discipline} value={discipline}>{discipline}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={selectedProfessor} onValueChange={setSelectedProfessor}>
        <SelectTrigger className="">
          <SelectValue placeholder="Selecione o professor" />
        </SelectTrigger>
        <SelectContent>
          {uniqueProfessors.map((professor) => (
            <SelectItem key={professor} value={professor}>{professor}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="semester" />
          <YAxis />
          <Tooltip />
          <Area type="monotone" dataKey="hours" stroke="#82ca9d" fillOpacity={1} fill="url(#colorHours)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
