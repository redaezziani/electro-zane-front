'use client';

import * as React from 'react';
import useSWR from 'swr';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { fetcher } from '@/lib/utils';
import { BestSellingProductDto } from '@/types/analytics';
import { IconTrophy, IconCircleCheck } from '@tabler/icons-react';
import { useLocale } from '@/components/local-lang-swither';
import { getMessages } from '@/lib/locale';
import { formatCurrency } from '@/lib/format-currency';

export function BestSellingProducts() {
  const { locale } = useLocale();
  const lang = getMessages(locale);
  const t = lang.pages?.analytics?.components?.bestSellingProducts || {};

  const { data } = useSWR<BestSellingProductDto[]>(
    '/analytics/best-selling-products?period=30&limit=10',
    fetcher,
    { refreshInterval: 60000 }
  );

  if (!data) return null;

  const getStockBadge = (status: string, days: number | null) => {
    if (status === 'OUT_OF_STOCK') {
      return (
        <Badge variant="destructive" className="text-xs">
          {t.labels?.outOfStock || 'Out of Stock'}
        </Badge>
      );
    }
    if (status === 'LOW') {
      return (
        <Badge variant="outline" className="text-xs border-orange-500 text-orange-600">
          {days
            ? `${t.labels?.low || 'Low'} (${Math.floor(days)}${t.labels?.daysLeft || 'd left'})`
            : t.labels?.low || 'Low'}
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-xs border-green-500 text-green-600">
        <IconCircleCheck className="h-3 w-3 mr-1" />
        {t.labels?.ok || 'OK'}
      </Badge>
    );
  };

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconTrophy className="h-5 w-5" style={{ color: 'var(--chart-4)' }} />
          {t.title || 'Best Selling Products'}
        </CardTitle>
        <CardDescription>{t.description || 'Top 10 products by sales volume'}</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {data.map((product, index) => (
              <div
                key={product.productId}
                className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent transition-colors"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm tabular-nums">
                  {index + 1}
                </div>
                {product.coverImage && (
                  <img
                    src={product.coverImage}
                    alt={product.productName}
                    className="w-12 h-12 object-cover rounded"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{product.productName}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {product.unitsSold} {t.labels?.unitsSold || 'units sold'}
                    </span>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {product.ordersCount} {t.labels?.orders || 'orders'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {getStockBadge(product.stockStatus, product.daysUntilStockout)}
                    <Badge variant="outline" className="text-xs tabular-nums">
                      {t.labels?.stock || 'Stock'}: {product.currentStock}
                    </Badge>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-sm font-bold tabular-nums" style={{ color: 'var(--chart-3)' }}>
                    {formatCurrency(product.totalRevenue, locale)}
                  </span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {formatCurrency(product.averagePrice, locale)} {t.labels?.avg || 'avg'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
