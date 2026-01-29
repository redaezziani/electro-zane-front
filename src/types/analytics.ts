// Analytics Types from Backend DTOs

export interface DailyCashSummaryDto {
  date: string;
  totalCash: number;
  ordersCount: number;
  averageOrderValue: number;
  completedPayments: number;
  pendingPayments: number;
  itemsSold: number;
}

export interface LowStockAlertDto {
  skuId: string;
  sku: string;
  productName: string;
  variantName: string;
  currentStock: number;
  lowStockAlert: number;
  price: number;
  coverImage: string | null;
  alertSeverity: number;
}

export interface DailyProfitDto {
  date: string;
  revenue: number;
  costOfGoods: number;
  grossProfit: number;
  profitMargin: number;
  ordersCount: number;
}

export interface ProfitSummaryDto {
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  averageProfitMargin: number;
  dailyBreakdown: DailyProfitDto[];
  bestDay: DailyProfitDto;
  worstDay: DailyProfitDto;
}

export interface BestSellingProductDto {
  productId: string;
  productName: string;
  unitsSold: number;
  totalRevenue: number;
  ordersCount: number;
  averagePrice: number;
  currentStock: number;
  coverImage: string | null;
  stockStatus: string;
  daysUntilStockout: number | null;
}

export interface HourlyPatternDto {
  hour: number;
  hourLabel: string;
  averageOrders: number;
  totalOrders: number;
  averageRevenue: number;
  totalRevenue: number;
  averageItemsSold: number;
  isPeakHour: boolean;
}

export interface HourlyPatternSummaryDto {
  hourlyData: HourlyPatternDto[];
  busiestHour: HourlyPatternDto;
  slowestHour: HourlyPatternDto;
  peakHours: HourlyPatternDto[];
  daysAnalyzed: number;
}

export interface StockValueByCategoryDto {
  categoryId: string;
  categoryName: string;
  totalStock: number;
  stockValue: number;
  productsCount: number;
  percentageOfTotal: number;
}

export interface StockValueByProductDto {
  productId: string;
  productName: string;
  totalStock: number;
  averagePrice: number;
  stockValue: number;
  variantsCount: number;
  coverImage: string | null;
}

export interface StockValueSummaryDto {
  totalStockValue: number;
  totalUnits: number;
  uniqueProducts: number;
  uniqueSkus: number;
  averageValuePerSku: number;
  lowStockValue: number;
  outOfStockValue: number;
  byCategory: StockValueByCategoryDto[];
  topProducts: StockValueByProductDto[];
}

export interface WeeklyTrendDataDto {
  weekNumber: number;
  weekLabel: string;
  startDate: string;
  endDate: string;
  ordersCount: number;
  revenue: number;
  itemsSold: number;
  averageOrderValue: number;
  uniqueCustomers: number;
  revenueGrowth: number;
  ordersGrowth: number;
}

export interface WeeklyTrendsSummaryDto {
  weeklyData: WeeklyTrendDataDto[];
  averageWeeklyRevenue: number;
  averageWeeklyOrders: number;
  bestWeek: WeeklyTrendDataDto;
  worstWeek: WeeklyTrendDataDto;
  trendDirection: string;
  overallGrowthRate: number;
  weeksAnalyzed: number;
}
