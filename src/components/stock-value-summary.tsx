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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { fetcher } from '@/lib/utils';
import { StockValueSummaryDto } from '@/types/analytics';
import { IconPackage, IconTag, IconBox } from '@tabler/icons-react';
import { useLocale } from '@/components/local-lang-swither';
import { getMessages } from '@/lib/locale';
import { formatCurrency } from '@/lib/format-currency';

export function StockValueSummary() {
  const { locale } = useLocale();
  const lang = getMessages(locale);
  const t = lang.pages?.analytics?.components?.stockValue || {};

  const { data } = useSWR<StockValueSummaryDto>(
    '/analytics/stock-value',
    fetcher,
    { refreshInterval: 300000 },
  );

  if (!data) return null;

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {t.title || 'Stock Value Summary'}
        </CardTitle>
        <CardDescription>
          {t.description || 'Total inventory worth on shelf'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg border">
            <p className="text-xs text-muted-foreground">
              {t.labels?.totalValue || 'Total Value'}
            </p>
            <p className="text-base font-bold tabular-nums">
              {formatCurrency(data.totalStockValue, locale)}
            </p>
          </div>
          <div className="p-3 rounded-lg border">
            <p className="text-xs text-muted-foreground">
              {t.labels?.totalUnits || 'Total Units'}
            </p>
            <p className="text-base font-bold tabular-nums">
              {data.totalUnits.toLocaleString(locale)}
            </p>
          </div>
          <div className="p-3 rounded-lg border">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              {t.labels?.products || 'Products'}
            </p>
            <p className="text-base font-semibold tabular-nums">
              {data.uniqueProducts}
            </p>
          </div>
          <div className="p-3 rounded-lg border">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              {t.labels?.skus || 'SKUs'}
            </p>
            <p className="text-base font-semibold tabular-nums">
              {data.uniqueSkus}
            </p>
          </div>
        </div>

        <Tabs defaultValue="categories" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="categories">
              {t.labels?.byCategory || 'By Category'}
            </TabsTrigger>
            <TabsTrigger value="products">
              {t.labels?.topProducts || 'Top Products'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="categories">
            <ScrollArea className="h-[250px] pr-4">
              <div className="space-y-2">
                {data.byCategory.map((category) => (
                  <div
                    key={category.categoryId}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {category.categoryName}
                      </p>
                      <p className="text-xs text-muted-foreground tabular-nums">
                        {category.productsCount}{' '}
                        {t.labels?.products || 'products'} •{' '}
                        {category.totalStock} {t.labels?.units || 'units'}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-sm font-bold tabular-nums">
                        {formatCurrency(category.stockValue, locale)}
                      </span>
                      <Badge variant="outline" className="text-xs tabular-nums">
                        {category.percentageOfTotal.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="products">
            <ScrollArea className="h-[250px] pr-4">
              <div className="space-y-2">
                {data.topProducts.map((product, index) => (
                  <div
                    key={product.productId}
                    className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center justify-center w-6 h-6 rounded-full  font-bold text-xs tabular-nums">
                      {index + 1}
                    </div>
                    {product.coverImage && (
                      <img
                        src={product.coverImage}
                        alt={product.productName}
                        className="w-10 h-10 object-cover rounded"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {product.productName}
                      </p>
                      <p className="text-xs text-muted-foreground tabular-nums">
                        {product.totalStock} {t.labels?.units || 'units'} •{' '}
                        {product.variantsCount}{' '}
                        {t.labels?.variants || 'variants'}
                      </p>
                      <p className="text-xs text-muted-foreground tabular-nums">
                        {formatCurrency(product.averagePrice, locale)}{' '}
                        {t.labels?.avg || 'avg'}
                      </p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-bold tabular-nums">
                        {formatCurrency(product.stockValue, locale)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
