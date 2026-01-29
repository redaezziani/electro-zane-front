'use client';
import { ChartAreaInteractive } from '@/components/chart-area-interactive';
import { SectionCards } from '@/components/section-cards';
import { ChartTopProducts } from '@/components/chart-top-products';
import { ChartTopProductsRadar } from '@/components/radar-chat';
import { ChartCategoryPerformance } from '@/components/category-performance';
import { DailyOverview } from '@/components/daily-overview';
import { ProfitTrackingChart } from '@/components/profit-tracking-chart';
import { BestSellingProducts } from '@/components/best-selling-products';
import { HourlyPatternChart } from '@/components/hourly-pattern-chart';
import { WeeklyTrendsChart } from '@/components/weekly-trends-chart';
import { StockValueSummary } from '@/components/stock-value-summary';

export default function Page() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {/* Key Metrics Cards */}
          <SectionCards />

          {/* Daily Overview (Cash Summary + Stock Alerts) and Weekly Trends */}
          <div className="px-4 lg:px-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <DailyOverview />
            <WeeklyTrendsChart />
          </div>

          {/* Main Revenue Chart */}
          <div className="px-4 lg:px-6">
            <ChartAreaInteractive />
          </div>

          {/* Profit Tracking */}
          <div className="px-4 lg:px-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ProfitTrackingChart />
            <StockValueSummary />
          </div>

          {/* Product Performance */}
          <div className="px-4 lg:px-6 grid grid-cols-1 gap-4 md:grid-cols-1 xl:grid-cols-3">
            <ChartTopProducts />
            <ChartTopProductsRadar />
            <ChartCategoryPerformance />
          </div>

          {/* Best Selling and Hourly Patterns */}
          <div className="px-4 lg:px-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <BestSellingProducts />
            <HourlyPatternChart />
          </div>
        </div>
      </div>
    </div>
  );
}
