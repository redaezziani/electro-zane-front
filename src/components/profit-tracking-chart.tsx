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
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
import { fetcher } from '@/lib/utils';
import { ProfitSummaryDto } from '@/types/analytics';
import { IconTrendingUp, IconTrendingDown } from '@tabler/icons-react';
import { useLocale } from '@/components/local-lang-swither';
import { getMessages } from '@/lib/locale';
import { formatCurrency } from '@/lib/format-currency';

export function ProfitTrackingChart() {
  const { locale } = useLocale();
  const lang = getMessages(locale);
  const t = lang.pages?.analytics?.components?.profitTracking || {};

  const [timeRange, setTimeRange] = React.useState('30d');
  const [period, setPeriod] = React.useState(30);

  const isRTL = locale === 'ar';

  React.useEffect(() => {
    if (timeRange === '90d') setPeriod(90);
    else if (timeRange === '30d') setPeriod(30);
    else setPeriod(7);
  }, [timeRange]);

  const { data } = useSWR<ProfitSummaryDto>(
    `/analytics/profit-tracking?period=${period}`,
    fetcher,
    { refreshInterval: 60000 },
  );

  if (!data) return null;

  const chartConfig = {
    revenue: {
      label: t.chartLabels?.revenue || 'Revenue',
      color: 'var(--chart-1)',
    },
    grossProfit: {
      label: t.chartLabels?.grossProfit || 'Gross Profit',
      color: 'var(--chart-2)',
    },
    costOfGoods: {
      label: t.chartLabels?.cost || 'Cost',
      color: 'var(--chart-5)',
    },
  } satisfies ChartConfig;

  const formatDate = (value: string) => {
    if (!value) return '';
    const date = new Date(value).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', {
      month: 'short',
      day: 'numeric',
    });
    return isRTL ? `\u200f${date}` : date;
  };

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {t.title || 'Profit Tracking'}
        </CardTitle>
        <CardDescription>
          {t.description
            ? t.description.replace('{days}', period.toString())
            : `Last ${period} days profit analysis`}
        </CardDescription>

        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:px-4! @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">
              {t.periods?.['90d'] || '90 Days'}
            </ToggleGroupItem>
            <ToggleGroupItem value="30d">
              {t.periods?.['30d'] || '30 Days'}
            </ToggleGroupItem>
            <ToggleGroupItem value="7d">
              {t.periods?.['7d'] || '7 Days'}
            </ToggleGroupItem>
          </ToggleGroup>

          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="flex w-40 @[767px]/card:hidden" size="sm">
              <SelectValue
                placeholder={t.selectPeriodPlaceholder || 'Select period'}
              />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d">
                {t.periods?.['90d'] || '90 Days'}
              </SelectItem>
              <SelectItem value="30d">
                {t.periods?.['30d'] || '30 Days'}
              </SelectItem>
              <SelectItem value="7d">
                {t.periods?.['7d'] || '7 Days'}
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
              {t.labels?.totalRevenue || 'Total Revenue'}
            </p>
            <p className="text-base font-bold tabular-nums">
              {formatCurrency(data.totalRevenue, locale)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">
              {t.labels?.totalCost || 'Total Cost'}
            </p>
            <p className="text-base font-bold tabular-nums">
              {formatCurrency(data.totalCost, locale)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">
              {t.labels?.totalProfit || 'Total Profit'}
            </p>
            <p className="text-base font-bold tabular-nums">
              {formatCurrency(data.totalProfit, locale)}
            </p>
          </div>
        </div>

        {/* Profit Margin */}
        <div className="text-center py-3 border-y px-4 sm:px-0">
          <p className="text-sm text-muted-foreground">
            {t.labels?.avgProfitMargin || 'Average Profit Margin'}
          </p>
          <p
            className="text-2xl font-bold tabular-nums mt-1"
            style={{
              color:
                data.averageProfitMargin >= 0
                  ? 'var(--chart-3)'
                  : 'var(--chart-5)',
            }}
          >
            {data.averageProfitMargin.toFixed(2)}%
          </p>
        </div>

        {/* Chart */}
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-62.5 w-full"
        >
          <AreaChart
            data={data.dailyBreakdown}
            margin={{ left: 12, right: 12 }}
          >
            <defs>
              <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={chartConfig.revenue.color}
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor={chartConfig.revenue.color}
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillGrossProfit" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={chartConfig.grossProfit.color}
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor={chartConfig.grossProfit.color}
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={formatDate}
              tick={{
                fill: 'hsl(var(--foreground))',
                fontSize: 12,
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={formatDate}
                  indicator="dot"
                />
              }
            />
            <Area
              type="natural"
              dataKey="revenue"
              fill="url(#fillRevenue)"
              stroke={chartConfig.revenue.color}
              stackId="a"
            />
            <Area
              type="natural"
              dataKey="grossProfit"
              fill="url(#fillGrossProfit)"
              stroke={chartConfig.grossProfit.color}
              stackId="b"
            />
          </AreaChart>
        </ChartContainer>

        {/* Best/Worst Day */}
        <div className="grid grid-cols-2 gap-3 px-4 sm:px-0">
          <div className="p-3 rounded-lg border">
            <p className="text-xs text-muted-foreground">
              {t.labels?.bestDay || 'Best Day'}
            </p>
            <p className="font-semibold text-sm mt-1">
              {formatDate(data.bestDay.date)}
            </p>
            <p
              className="font-bold tabular-nums mt-1"
              style={{ color: 'var(--chart-3)' }}
            >
              {formatCurrency(data.bestDay.grossProfit, locale)}
            </p>
          </div>
          <div className="p-3 rounded-lg border">
            <p className="text-xs text-muted-foreground">
              {t.labels?.worstDay || 'Worst Day'}
            </p>
            <p className="font-semibold text-sm mt-1">
              {formatDate(data.worstDay.date)}
            </p>
            <p
              className="font-bold tabular-nums mt-1"
              style={{ color: 'var(--chart-5)' }}
            >
              {formatCurrency(data.worstDay.grossProfit, locale)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
