'use client';

import * as React from 'react';
import useSWR from 'swr';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fetcher } from '@/lib/utils';
import { HourlyPatternSummaryDto } from '@/types/analytics';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { IconClock } from '@tabler/icons-react';
import { useLocale } from '@/components/local-lang-swither';
import { getMessages } from '@/lib/locale';

export function HourlyPatternChart() {
  const { locale } = useLocale();
  const lang = getMessages(locale);
  const t = lang.pages?.analytics?.components?.hourlyPattern || {};

  const { data } = useSWR<HourlyPatternSummaryDto>(
    '/analytics/hourly-pattern?period=30',
    fetcher,
    { refreshInterval: 60000 },
  );

  if (!data) return null;

  const chartConfig = {
    totalOrders: {
      label: t.chartLabels?.orders || 'Orders',
      color: 'var(--chart-1)',
    },
    totalRevenue: {
      label: t.chartLabels?.revenue || 'Revenue',
      color: 'var(--chart-2)',
    },
  } satisfies ChartConfig;

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {t.title || 'Hourly Sales Pattern'}
        </CardTitle>
        <CardDescription>
          {t.description
            ? t.description.replace('{days}', data.daysAnalyzed.toString())
            : `Last ${data.daysAnalyzed} days average`}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6 space-y-4">
        <div className="grid grid-cols-2 gap-3 px-4 sm:px-0">
          <div className="p-3 rounded-lg border">
            <p className="text-xs text-muted-foreground">
              {t.labels?.busiestHour || 'Busiest Hour'}
            </p>
            <p
              className="font-bold text-sm mt-1"
              style={{ color: 'var(--chart-1)' }}
            >
              {data.busiestHour.hourLabel}
            </p>
            <p className="text-xs tabular-nums mt-1">
              {data.busiestHour.totalOrders} {t.labels?.orders || 'orders'}
            </p>
          </div>
          <div className="p-3 rounded-lg border">
            <p className="text-xs text-muted-foreground">
              {t.labels?.slowestHour || 'Slowest Hour'}
            </p>
            <p className="font-bold text-sm mt-1">
              {data.slowestHour.hourLabel}
            </p>
            <p className="text-xs tabular-nums mt-1">
              {data.slowestHour.totalOrders} {t.labels?.orders || 'orders'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 px-4 sm:px-0">
          <span className="text-xs text-muted-foreground">
            {t.labels?.peakHours || 'Peak Hours'}:
          </span>
          {data.peakHours.map((hour) => (
            <Badge
              key={hour.hour}
              variant="secondary"
              className="text-xs tabular-nums"
            >
              {hour.hourLabel}
            </Badge>
          ))}
        </div>

        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-62.5 w-full"
        >
          <BarChart data={data.hourlyData} margin={{ left: 12, right: 12 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="hour"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => `${value}h`}
              tick={{
                fill: 'hsl(var(--foreground))',
                fontSize: 12,
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{
                fill: 'hsl(var(--foreground))',
                fontSize: 12,
              }}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Bar
              dataKey="totalOrders"
              fill={chartConfig.totalOrders.color}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
