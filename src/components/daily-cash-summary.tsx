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
import { DailyCashSummaryDto } from '@/types/analytics';
import {
  IconCash,
  IconShoppingCart,
  IconPackage,
  IconClock,
} from '@tabler/icons-react';
import { useLocale } from '@/components/local-lang-swither';
import { getMessages } from '@/lib/locale';
import { formatCurrency } from '@/lib/format-currency';

export function DailyCashSummary() {
  const { locale } = useLocale();
  const lang = getMessages(locale);
  const t = lang.pages?.analytics?.components?.dailyCashSummary || {};

  const { data } = useSWR<DailyCashSummaryDto>(
    '/analytics/daily-cash-summary?period=1',
    fetcher,
    { refreshInterval: 30000 },
  );

  if (!data) return null;

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>{t.title || 'Daily Cash Summary'}</CardTitle>
        <CardDescription>{data.date}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              {t.labels?.totalCash || 'Total Cash'}
            </p>
            <p className="text-base font-bold tabular-nums">
              {formatCurrency(data.totalCash, locale)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              {t.labels?.orders || 'Orders'}
            </p>
            <p className="text-base font-bold tabular-nums">
              {data.ordersCount}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              {t.labels?.avgOrderValue || 'Avg Order Value'}
            </p>
            <p className="text-base font-semibold tabular-nums">
              {formatCurrency(data.averageOrderValue, locale)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              {t.labels?.itemsSold || 'Items Sold'}
            </p>
            <p className="text-base font-semibold tabular-nums">
              {data.itemsSold}
            </p>
          </div>
        </div>

        <div className="pt-4 border-t space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">
              {t.labels?.completedPayments || 'Completed Payments'}
            </span>
            <Badge variant="default" className="tabular-nums">
              {formatCurrency(data.completedPayments, locale)}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm flex items-center gap-1">
              {t.labels?.pendingPayments || 'Pending Payments'}
            </span>
            <Badge variant="secondary" className="tabular-nums">
              {formatCurrency(data.pendingPayments, locale)}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
