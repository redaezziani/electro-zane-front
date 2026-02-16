"use client";

import { useState } from "react";
import { useLocale } from "@/components/local-lang-swither";
import { getMessages } from "@/lib/locale";
import { ShipmentStatus } from "@/services/api/lots";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface ShipmentsFiltersProps {
  onFilterChange: (filters: { status?: ShipmentStatus | 'ALL'; startDate?: Date; endDate?: Date }) => void;
}

export function ShipmentsFilters({ onFilterChange }: ShipmentsFiltersProps) {
  const { locale } = useLocale();
  const t = getMessages(locale);

  const [status, setStatus] = useState<ShipmentStatus | 'ALL'>('ALL');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const handleStatusChange = (value: string) => {
    const newStatus = value as ShipmentStatus | 'ALL';
    setStatus(newStatus);
    onFilterChange({
      status: newStatus,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  };

  const handleDateChange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
    onFilterChange({
      status: status === 'ALL' ? undefined : status,
      startDate: start ? new Date(start) : undefined,
      endDate: end ? new Date(end) : undefined,
    });
  };

  return (
    <div className="flex flex-wrap gap-4 p-4 border rounded-lg bg-muted/30">
      <div className="flex-1 min-w-48">
        <Label htmlFor="status">{t.pages.shipments?.filters?.status || "Filter by Status"}</Label>
        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger id="status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t.common.all || "All"}</SelectItem>
            <SelectItem value={ShipmentStatus.PENDING}>
              {t.pages.shipments?.status?.PENDING || "Pending"}
            </SelectItem>
            <SelectItem value={ShipmentStatus.IN_TRANSIT}>
              {t.pages.shipments?.status?.IN_TRANSIT || "In Transit"}
            </SelectItem>
            <SelectItem value={ShipmentStatus.ARRIVED}>
              {t.pages.shipments?.status?.ARRIVED || "Arrived"}
            </SelectItem>
            <SelectItem value={ShipmentStatus.VERIFIED}>
              {t.pages.shipments?.status?.VERIFIED || "Verified"}
            </SelectItem>
            <SelectItem value={ShipmentStatus.CANCELLED}>
              {t.pages.shipments?.status?.CANCELLED || "Cancelled"}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 min-w-48">
        <Label htmlFor="startDate">
          {t.pages.shipments?.filters?.dateRange || "Date Range"}
        </Label>
        <div className="flex gap-2">
          <input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => handleDateChange(e.target.value, endDate)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <span className="flex items-center">-</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => handleDateChange(startDate, e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      </div>
    </div>
  );
}
