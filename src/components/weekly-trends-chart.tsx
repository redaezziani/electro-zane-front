'use client';

import * as React from 'react';
import useSWR from 'swr';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Line, LineChart, CartesianGrid, XAxis } from 'recharts';
import { fetcher } from '@/lib/utils';
import { WeeklyTrendsSummaryDto } from '@/types/analytics';
import {
  IconTrendingUp,
  IconTrendingDown,
  IconMinus,
} from '@tabler/icons-react';
import { useLocale } from '@/components/local-lang-swither';
import { getMessages } from '@/lib/locale';
import { formatCurrency } from '@/lib/format-currency';

export function WeeklyTrendsChart() {
  const { locale } = useLocale();
  const lang = getMessages(locale);
  const t = lang.pages?.analytics?.components?.weeklyTrends || {};

  const [timeRange, setTimeRange] = React.useState('12w');
  const [weeks, setWeeks] = React.useState(12);

  const isRTL = locale === 'ar';

  React.useEffect(() => {
    if (timeRange === '12w') setWeeks(12);
    else if (timeRange === '8w') setWeeks(8);
    else setWeeks(4);
  }, [timeRange]);

  const { data } = useSWR<WeeklyTrendsSummaryDto>(
    `/analytics/weekly-trends?weeks=${weeks}`,
    fetcher,
    { refreshInterval: 300000 },
  );

  if (!data) return null;

  const chartConfig = {
    revenue: {
      label: t.chartLabels?.revenue || 'Revenue',
      color: 'var(--chart-1)',
    },
    ordersCount: {
      label: t.chartLabels?.orders || 'Orders',
      color: 'var(--chart-2)',
    },
  } satisfies ChartConfig;

  const getTrendIcon = () => {
    if (data.trendDirection === 'GROWING')
      return (
        <IconTrendingUp
          className="h-5 w-5"
          style={{ color: 'var(--chart-3)' }}
        />
      );
    if (data.trendDirection === 'DECLINING')
      return (
        <IconTrendingDown
          className="h-5 w-5"
          style={{ color: 'var(--chart-5)' }}
        />
      );
    return <IconMinus className="h-5 w-5 text-muted-foreground" />;
  };

  const getTrendColor = () => {
    if (data.trendDirection === 'GROWING') return 'var(--chart-3)';
    if (data.trendDirection === 'DECLINING') return 'var(--chart-5)';
    return 'hsl(var(--muted-foreground))';
  };

  const getTrendLabel = () => {
    if (data.trendDirection === 'GROWING')
      return t.labels?.growing || 'GROWING';
    if (data.trendDirection === 'DECLINING')
      return t.labels?.declining || 'DECLINING';
    return t.labels?.stable || 'STABLE';
  };

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {t.title || 'Weekly Trends'}
        </CardTitle>
        <CardDescription>
          {t.description
            ? t.description.replace('{weeks}', data.weeksAnalyzed.toString())
            : `Last ${data.weeksAnalyzed} weeks performance`}
        </CardDescription>

        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="12w">
              {t.periods?.['12w'] || '12 Weeks'}
            </ToggleGroupItem>
            <ToggleGroupItem value="8w">
              {t.periods?.['8w'] || '8 Weeks'}
            </ToggleGroupItem>
            <ToggleGroupItem value="4w">
              {t.periods?.['4w'] || '4 Weeks'}
            </ToggleGroupItem>
          </ToggleGroup>

          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="flex w-40 @[767px]/card:hidden" size="sm">
              <SelectValue
                placeholder={t.selectPeriodPlaceholder || 'Select period'}
              />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="12w">
                {t.periods?.['12w'] || '12 Weeks'}
              </SelectItem>
              <SelectItem value="8w">
                {t.periods?.['8w'] || '8 Weeks'}
              </SelectItem>
              <SelectItem value="4w">
                {t.periods?.['4w'] || '4 Weeks'}
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6 space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 px-4 sm:px-0">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">
              {t.labels?.trend || 'Trend'}
            </p>
            <p
              className="text-base font-bold tabular-nums"
              style={{ color: getTrendColor() }}
            >
              {getTrendLabel()}
            </p>
            <p className="text-xs text-muted-foreground tabular-nums">
              {data.overallGrowthRate > 0 ? '+' : ''}
              {data.overallGrowthRate.toFixed(1)}%
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">
              {t.labels?.avgRevenue || 'Avg Revenue'}
            </p>
            <p className="text-base font-bold tabular-nums">
              {formatCurrency(data.averageWeeklyRevenue, locale)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">
              {t.labels?.avgOrders || 'Avg Orders'}
            </p>
            <p className="text-base font-bold tabular-nums">
              {Math.round(data.averageWeeklyOrders)}
            </p>
          </div>
        </div>

        {/* Chart */}
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <LineChart data={data.weeklyData} margin={{ left: 12, right: 12 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="weekLabel"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tick={{
                fill: 'hsl(var(--foreground))',
                fontSize: 12,
              }}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke={chartConfig.revenue.color}
              strokeWidth={2}
              dot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="ordersCount"
              stroke={chartConfig.ordersCount.color}
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ChartContainer>

        {/* Best/Worst Week */}
        <div className="grid grid-cols-2 gap-3 px-4 sm:px-0">
          <div className="p-3 rounded-lg border">
            <p className="text-xs text-muted-foreground">
              {t.labels?.bestWeek || 'Best Week'}
            </p>
            <p className="font-semibold text-sm mt-1">
              {data.bestWeek.weekLabel}
            </p>
            <p
              className="font-bold tabular-nums mt-1"
              style={{ color: 'var(--chart-3)' }}
            >
              {formatCurrency(data.bestWeek.revenue, locale)}
            </p>
          </div>
          <div className="p-3 rounded-lg border">
            <p className="text-xs text-muted-foreground">
              {t.labels?.worstWeek || 'Worst Week'}
            </p>
            <p className="font-semibold text-sm mt-1">
              {data.worstWeek.weekLabel}
            </p>
            <p
              className="font-bold tabular-nums mt-1"
              style={{ color: 'var(--chart-5)' }}
            >
              {formatCurrency(data.worstWeek.revenue, locale)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
