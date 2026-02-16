"use client";

import { useState } from "react";
import { useLocale } from "@/components/local-lang-swither";
import { getMessages } from "@/lib/locale";
import { ShipmentsFilters } from "@/components/shipments/shipments-filters";
import { EnhancedShipmentsTable } from "@/components/shipments/enhanced-shipments-table";
import { ShipmentStatus } from "@/services/api/lots";

export default function ShipmentsPage() {
  const { locale } = useLocale();
  const t = getMessages(locale);

  const [filters, setFilters] = useState<{
    status?: ShipmentStatus | 'ALL';
    startDate?: Date;
    endDate?: Date;
  }>({ status: 'ALL' });

  return (
    <section className="flex flex-col gap-4 w-full px-6 py-4">
      <h1 className="text-2xl font-semibold">
        {t.pages.shipments?.title || "Shipments"}
      </h1>

      <ShipmentsFilters onFilterChange={setFilters} />

      <EnhancedShipmentsTable
        statusFilter={filters.status}
        startDate={filters.startDate}
        endDate={filters.endDate}
      />
    </section>
  );
}
