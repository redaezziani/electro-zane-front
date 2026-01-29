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
import { fetcher } from '@/lib/utils';
import { LowStockAlertDto } from '@/types/analytics';
import { IconAlertTriangle } from '@tabler/icons-react';
import { useLocale } from '@/components/local-lang-swither';
import { getMessages } from '@/lib/locale';
import { formatCurrency } from '@/lib/format-currency';

export function LowStockAlerts() {
  const { locale } = useLocale();
  const lang = getMessages(locale);
  const t = lang.pages?.analytics?.components?.lowStockAlerts || {};

  const { data } = useSWR<LowStockAlertDto[]>(
    '/analytics/low-stock-alerts',
    fetcher,
    { refreshInterval: 60000 },
  );

  if (!data) return null;

  const getSeverityColor = (severity: number) => {
    if (severity >= 75) return 'bg-red-500';
    if (severity >= 50) return 'bg-orange-500';
    return 'bg-yellow-500';
  };

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {t.title || 'Low Stock Alerts'}
        </CardTitle>
        <CardDescription>
          {data.length} {t.productsNeedAttention || 'products need attention'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-50 ">
          <div className="space-y-3">
            {data.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                {t.allWellStocked || 'All products are well-stocked!'}
              </p>
            ) : (
              data.map((item) => (
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
                        {t.labels?.stock || 'Stock'}: {item.currentStock}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {t.labels?.alert || 'Alert'}: {item.lowStockAlert}
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
