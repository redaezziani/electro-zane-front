"use client";

import { useState, useEffect, useCallback } from "react";
import { LogsTable } from "@/components/logs/logs-table";
import { LogsFilters } from "@/components/logs/logs-filters";
import { logsApi, LogsQuery, LogType, LogEntry } from "@/services/api/logs";
import { useLocale } from "@/components/local-lang-swither";
import { getMessages } from "@/lib/locale";
import { toast } from "sonner";

export default function LogsPage() {
  const { locale } = useLocale();
  const t = getMessages(locale);

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });

  const [filters, setFilters] = useState<LogsQuery>({
    page: 1,
    limit: 50,
    type: LogType.ACTIVITY,
  });

  // Fetch logs
  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await logsApi.getLogs(filters);
      setLogs(response.data);
      setPagination({
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: response.totalPages,
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error fetching logs:", error);
      toast.error(t.pages.logs.table.error);
    } finally {
      setLoading(false);
    }
  }, [filters, t.pages.logs.table.error]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleFilterChange = (newFilters: Partial<LogsQuery>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  return (
    <section className="flex flex-col gap-4 w-full px-6 py-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">{t.pages.logs.title}</h1>
          <p className="text-muted-foreground">{t.pages.logs.description}</p>
        </div>
      </div>

      <LogsFilters filters={filters} onFilterChange={handleFilterChange} />

      <LogsTable
        logs={logs}
        loading={loading}
        pagination={pagination}
        onPageChange={handlePageChange}
      />
    </section>
  );
}
