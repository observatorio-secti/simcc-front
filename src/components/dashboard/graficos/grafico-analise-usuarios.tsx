import { useEffect, useState } from "react";
import axios from "axios";
import { XAxis, Tooltip, ResponsiveContainer, LabelList, BarChart, Bar } from "recharts";
import { ChartContainer, ChartConfig, ChartTooltip, ChartTooltipContent } from "../../../components/ui/chart";
import { parse, format as formatDate } from "date-fns"; // Importação para formatação de data

interface AnalyticsData {
  date: string;
  users: number;
}

const chartConfig: ChartConfig = {
  '2': { label: "Category 2", color: "hsl(var(--chart-1))" },
  "1A": { label: "Category 1A", color: "hsl(var(--chart-2))" },
  "1B": { label: "Category 1B", color: "hsl(var(--chart-3))" },
  "1C": { label: "Category 1C", color: "hsl(var(--chart-4))" },
  "1D": { label: "Category 1D", color: "hsl(var(--chart-5))" },
  'SR': { label: "Category SR", color: "hsl(var(--chart-6))" },
};

const REFRESH_TOKEN = import.meta.env.VITE_REFRESH_TOKEN
const CLIENT_ID = import.meta.env.VITE_REFRESH_TOKEN
const CLIENT_SECRET = import.meta.env.VITE_REFRESH_TOKEN

const refreshAccessToken = async () => {
  try {
    const response = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: REFRESH_TOKEN,
      grant_type: 'refresh_token',
    });

    const { access_token } = response.data;
    localStorage.setItem('access_token', access_token);
    return access_token;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Erro ao renovar o token:', error.message);
    } else {
      console.error('Unexpected error', error);
    }
  }
};

export function GraficoAnaliseUsuarios() {
  const [data, setData] = useState<AnalyticsData[]>([]);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        let accessToken = localStorage.getItem('access_token');

        if (!accessToken) {
          accessToken = await refreshAccessToken();
        }

        const response = await axios.post(
          `https://analyticsdata.googleapis.com/v1beta/properties/453631025:runReport`,
          {
            dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
            dimensions: [{ name: 'date' }],
            metrics: [{ name: 'activeUsers' }],
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          }
        );

        const reports = response.data.rows || [];
        const formattedData = reports.map((row: any) => ({
          date: formatDate(parse(row.dimensionValues?.[0].value, "yyyyMMdd", new Date()), "dd/MM/yyyy"),
          users: Number(row.metricValues?.[0].value),
        }));

        // Ordena os dados pela data
        const sortedData = formattedData.sort((a, b) => {
          return new Date(a.date.split('/').reverse().join('-')).getTime() - new Date(b.date.split('/').reverse().join('-')).getTime();
        });

        setData(sortedData);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          console.error('Error response:', error.response);
        } else {
          console.error('Error:', error);
        }
      }
    };

    fetchAnalyticsData();
  }, []);

  console.log(data);

  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
          <XAxis dataKey="date" tickLine={false} tickMargin={10} axisLine={false} />
          <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
          <Tooltip />
          <Bar dataKey="users" fill="#719CB8" radius={4}>
            <LabelList dataKey="users" position="top" offset={12} className="fill-foreground" fontSize={12} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
