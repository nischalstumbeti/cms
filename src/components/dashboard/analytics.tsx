"use client";

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { Pie, PieChart, Cell } from 'recharts';
import { useContest } from '@/context/ContestContext';

const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export function Analytics() {
  const { participants } = useContest();

  const genderData = useMemo(() => {
    const counts = participants.reduce((acc, p) => {
      acc[p.gender] = (acc[p.gender] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts).map(([gender, count]) => ({
      name: gender.charAt(0).toUpperCase() + gender.slice(1).replace(/-/g, ' '),
      value: count,
    }));
  }, [participants]);

  const professionData = useMemo(() => {
    const counts = participants.reduce((acc, p) => {
      const profession = p.profession.trim().toLowerCase();
      acc[profession] = (acc[profession] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts).map(([profession, count]) => ({
      name: profession.charAt(0).toUpperCase() + profession.slice(1),
      value: count,
    })).sort((a,b) => b.value - a.value).slice(0, 5); // top 5 professions
  }, [participants]);


  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Gender Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          {participants.length > 0 ? (
          <ChartContainer config={{}} className="mx-auto aspect-square max-h-[300px]">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
              <Pie data={genderData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                {genderData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <ChartLegend content={<ChartLegendContent />} />
            </PieChart>
          </ChartContainer>
          ) : <p className="text-muted-foreground">No participant data available.</p>}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Profession Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          {participants.length > 0 ? (
          <ChartContainer config={{}} className="mx-auto aspect-square max-h-[300px]">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
              <Pie data={professionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                 {professionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <ChartLegend content={<ChartLegendContent />} />
            </PieChart>
          </ChartContainer>
          ) : <p className="text-muted-foreground">No participant data available.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
