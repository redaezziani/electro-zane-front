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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { fetcher } from '@/lib/utils';
import { DailyCashSummaryDto, LowStockAlertDto } from '@/types/analytics';
import { IconCash, IconAlertTriangle } from '@tabler/icons-react';
import { useLocale } from '@/components/local-lang-swither';
import { getMessages } from '@/lib/locale';
import { formatCurrency } from '@/lib/format-currency';

export function DailyOverview() {
  const { locale } = useLocale();
  const lang = getMessages(locale);
  const tCash = lang.pages?.analytics?.components?.dailyCashSummary || {};
  const tStock = lang.pages?.analytics?.components?.lowStockAlerts || {};

  const { data: cashData } = useSWR<DailyCashSummaryDto>(
    '/analytics/daily-cash-summary?period=1',
    fetcher,
    { refreshInterval: 30000 },
  );

  const { data: stockData } = useSWR<LowStockAlertDto[]>(
    '/analytics/low-stock-alerts',
    fetcher,
    { refreshInterval: 60000 },
  );

  const getSeverityColor = (severity: number) => {
    if (severity >= 75) return 'bg-red-500';
    if (severity >= 50) return 'bg-orange-500';
    return 'bg-yellow-500';
  };

  if (!cashData || !stockData) return null;

  return (
    <Card className="@container/card">
      {/* Daily Cash Summary Section */}
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {tCash.title || 'Daily Cash Summary'}
        </CardTitle>
        <CardDescription>{cashData.date}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              {tCash.labels?.totalCash || 'Total Cash'}
            </p>
            <p className="text-base font-bold tabular-nums">
              {formatCurrency(cashData.totalCash, locale)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              {tCash.labels?.orders || 'Orders'}
            </p>
            <p className="text-base font-bold tabular-nums">
              {cashData.ordersCount}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              {tCash.labels?.avgOrderValue || 'Avg Order Value'}
            </p>
            <p className="text-base font-semibold tabular-nums">
              {formatCurrency(cashData.averageOrderValue, locale)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              {tCash.labels?.itemsSold || 'Items Sold'}
            </p>
            <p className="text-base font-semibold tabular-nums">
              {cashData.itemsSold}
            </p>
          </div>
        </div>

        <div className="pt-2 border-t space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">
              {tCash.labels?.completedPayments || 'Completed Payments'}
            </span>
            <Badge variant="default" className="tabular-nums">
              {formatCurrency(cashData.completedPayments, locale)}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">
              {tCash.labels?.pendingPayments || 'Pending Payments'}
            </span>
            <Badge variant="secondary" className="tabular-nums">
              {formatCurrency(cashData.pendingPayments, locale)}
            </Badge>
          </div>
        </div>
      </CardContent>

      {/* Separator */}
      <Separator className="my-4" />

      {/* Low Stock Alerts Section */}
      <CardHeader className="pt-0">
        <CardTitle className="flex items-center gap-2">
          {tStock.title || 'Low Stock Alerts'}
        </CardTitle>
        <CardDescription>
          {stockData.length}{' '}
          {tStock.productsNeedAttention || 'products need attention'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-40 pr-4">
          <div className="space-y-3">
            {stockData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                {tStock.allWellStocked || 'All products are well-stocked!'}
              </p>
            ) : (
              stockData.map((item) => (
                <div
                  key={item.skuId}
                  className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent transition-colors"
                >
                  {item.coverImage && (
                    <img
                      src={item.coverImage}
                      alt={item.productName}
                      className="w-12 h-12 object-cover rounded"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {item.productName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.variantName}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {tStock.labels?.stock || 'Stock'}: {item.currentStock}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {tStock.labels?.alert || 'Alert'}: {item.lowStockAlert}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge
                      className={`${getSeverityColor(item.alertSeverity)} text-white tabular-nums`}
                    >
                      {item.alertSeverity}%
                    </Badge>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {formatCurrency(item.price, locale)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
