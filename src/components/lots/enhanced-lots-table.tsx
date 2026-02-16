'use client';

import { useState, useEffect } from 'react';
import { DataTable, TableColumn } from '@/components/shared/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import { useLocale } from '@/components/local-lang-swither';
import { getMessages } from '@/lib/locale';
import { lotsApi, Lot, LotStatus, LotPiece, PieceStatus } from '@/services/api/lots';
import { toast } from 'sonner';
import { CreateLotDialog } from './create-lot-dialog';
import { CreateLotPieceDialog } from './create-lot-piece-dialog';
import { EditLotDialog } from './edit-lot-dialog';
import { EditLotPieceDialog } from './edit-lot-piece-dialog';

interface EnhancedLotsTableProps {
  startDate?: Date;
  endDate?: Date;
  initialSearch?: string;
}

export function EnhancedLotsTable({ startDate, endDate, initialSearch }: EnhancedLotsTableProps) {
  const { locale } = useLocale();
  const t = getMessages(locale);

  const [lots, setLots] = useState<Lot[]>([]);
  const [filteredLots, setFilteredLots] = useState<Lot[]>([]);
  const [loading, setLoading] = useState(true);
  const [lotPieces, setLotPieces] = useState<Record<string, LotPiece[]>>({});
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createPieceDialogOpen, setCreatePieceDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editPieceDialogOpen, setEditPieceDialogOpen] = useState(false);
  const [selectedLot, setSelectedLot] = useState<Lot | null>(null);
  const [selectedPiece, setSelectedPiece] = useState<LotPiece | null>(null);
  const [search, setSearch] = useState(initialSearch || '');

  const fetchLots = async () => {
    try {
      setLoading(true);
      const response = await lotsApi.getLots(1, 100);
      setLots(response.lots);
    } catch (error) {
      console.error('Failed to fetch lots:', error);
      toast.error(t.pages.lots.fetchError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLots();
  }, []);

  // Update search when initialSearch changes
  useEffect(() => {
    if (initialSearch) {
      setSearch(initialSearch);
    }
  }, [initialSearch]);

  // Filter lots by date range and search
  useEffect(() => {
    let filtered = lots;

    if (startDate) {
      filtered = filtered.filter((lot) => {
        const lotDate = new Date(lot.createdAt);
        return lotDate >= startDate;
      });
    }

    if (endDate) {
      filtered = filtered.filter((lot) => {
        const lotDate = new Date(lot.createdAt);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        return lotDate <= end;
      });
    }

    // Filter by search term
    if (search) {
      filtered = filtered.filter((lot) => {
        const lotMatches =
          lot.companyName?.toLowerCase().includes(search.toLowerCase()) ||
          lot.companyCity?.toLowerCase().includes(search.toLowerCase()) ||
          lot.lotId?.toString().includes(search) ||
          lot.notes?.toLowerCase().includes(search.toLowerCase());

        // Check if any piece matches
        const pieces = lotPieces[lot.id] || [];
        const pieceMatches = pieces.some((piece) =>
          piece.name?.toLowerCase().includes(search.toLowerCase()) ||
          piece.pieceId?.toString().includes(search)
        );

        return lotMatches || pieceMatches;
      });
    }

    setFilteredLots(filtered);
  }, [lots, startDate, endDate, search, lotPieces]);

  const getStatusBadge = (status: LotStatus) => {
    const statusConfig = {
      PENDING: {
        variant: 'secondary' as const,
        label: t.pages.lots.status.pending,
      },
      IN_TRANSIT: {
        variant: 'default' as const,
        label: t.pages.lots.status.inTransit,
      },
      ARRIVED: {
        variant: 'outline' as const,
        label: t.pages.lots.status.arrived,
      },
      VERIFIED: {
        variant: 'default' as const,
        label: t.pages.lots.status.verified,
      },
      COMPLETED: {
        variant: 'default' as const,
        label: t.pages.lots.status.completed,
      },
      CANCELLED: {
        variant: 'destructive' as const,
        label: t.pages.lots.status.cancelled,
      },
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPieceStatusBadge = (status: PieceStatus) => {
    const statusConfig: Record<PieceStatus, { className: string; label: string }> = {
      NEW: {
        className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border-blue-200 dark:border-blue-800',
        label: t.pages.lots.pieceStatus?.NEW || 'New',
      },
      USED: {
        className: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300 border-gray-200 dark:border-gray-800',
        label: t.pages.lots.pieceStatus?.USED || 'Used',
      },
      REFURBISHED: {
        className: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 border-purple-200 dark:border-purple-800',
        label: t.pages.lots.pieceStatus?.REFURBISHED || 'Refurbished',
      },
      DAMAGED: {
        className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 border-red-200 dark:border-red-800',
        label: t.pages.lots.pieceStatus?.DAMAGED || 'Damaged',
      },
      AVAILABLE: {
        className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-200 dark:border-green-800',
        label: t.pages.lots.pieceStatus?.AVAILABLE || 'Available',
      },
      SHIPPED: {
        className: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300 border-orange-200 dark:border-orange-800',
        label: t.pages.lots.pieceStatus?.SHIPPED || 'Shipped',
      },
      ARRIVED: {
        className: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300 border-teal-200 dark:border-teal-800',
        label: t.pages.lots.pieceStatus?.ARRIVED || 'Arrived',
      },
    };

    const config = statusConfig[status] || statusConfig.NEW;
    return <Badge variant="outline" className={config.className}>{config.label}</Badge>;
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t.pages.lots.confirmDelete)) return;

    try {
      await lotsApi.deleteLot(id);
      toast.success(t.pages.lots.deleteSuccess);
      fetchLots();
    } catch (error) {
      console.error('Failed to delete lot:', error);
      toast.error(t.pages.lots.deleteError);
    }
  };

  const handleEdit = (lot: Lot) => {
    setSelectedLot(lot);
    setEditDialogOpen(true);
  };

  const handleAddPiece = (lot: Lot) => {
    setSelectedLot(lot);
    setCreatePieceDialogOpen(true);
  };

  const handleEditPiece = (lot: Lot, piece: LotPiece) => {
    setSelectedLot(lot);
    setSelectedPiece(piece);
    setEditPieceDialogOpen(true);
  };

  const handleDeletePiece = async (lotId: string, pieceId: string) => {
    if (!confirm(t.pages.lots.confirmDeletePiece || 'Are you sure you want to delete this piece?')) return;

    try {
      await lotsApi.deleteLotPiece(pieceId);
      toast.success(t.pages.lots.deletePieceSuccess || 'Piece deleted successfully');

      // Refresh lot pieces
      const response = await lotsApi.getLotPiecesByLotId(lotId);
      setLotPieces((prev) => ({
        ...prev,
        [lotId]: response.pieces,
      }));

      // Refresh lots to get updated totals
      fetchLots();
    } catch (error) {
      console.error('Failed to delete piece:', error);
      toast.error(t.pages.lots.deletePieceError || 'Failed to delete piece');
    }
  };

  const handleRowExpand = async (lot: Lot) => {
    if (!lotPieces[lot.id]) {
      try {
        const response = await lotsApi.getLotPiecesByLotId(lot.id);
        setLotPieces((prev) => ({ ...prev, [lot.id]: response.pieces }));
      } catch (error) {
        console.error('Failed to fetch lot pieces:', error);
        toast.error(t.pages.lots.fetchPiecesError || 'Failed to fetch pieces');
      }
    }
  };

  const renderExpandedRow = (lot: Lot) => {
    const pieces = lotPieces[lot.id];

    return (
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">{t.pages.lots.pieces || 'Pieces'}</h3>
          <Button
            size="sm"
            onClick={() => handleAddPiece(lot)}
          >
            <Plus className="h-4 w-4 mr-2" />
            {t.pages.lots.addPiece || 'Add Piece'}
          </Button>
        </div>

        {!pieces || pieces.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t.pages.lots.noPieces || 'No pieces added yet'}
          </p>
        ) : (
          <div className="space-y-2">
            {pieces.map((piece) => (
              <div
                key={piece.id}
                className="border rounded p-3 bg-background"
                style={{ borderLeftColor: piece.color || undefined, borderLeftWidth: piece.color ? '4px' : undefined }}
              >
                <div className="flex justify-between items-start">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm flex-1">
                    <div>
                      <span className="font-medium">
                        {t.pages.lots.pieceId || 'Piece #'}:
                      </span>{' '}
                      #{piece.pieceId}
                    </div>
                    <div className="md:col-span-2">
                      <span className="font-medium">
                        {t.pages.lots.pieceName || 'Name'}:
                      </span>{' '}
                      {piece.name}
                    </div>
                    <div>
                      <span className="font-medium">
                        {t.common.quantity}:
                      </span>{' '}
                      {piece.quantity}
                    </div>
                    <div>
                      <span className="font-medium">
                        {t.pages.lots.unitPrice || 'Unit Price'}:
                      </span>{' '}
                      {Number(piece.unitPrice).toFixed(2)} MAD
                    </div>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditPiece(lot, piece)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePiece(lot.id, piece.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>

                <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  <div>
                    <span className="font-medium">
                      {t.pages.lots.totalPrice || 'Total'}:
                    </span>{' '}
                    {Number(piece.totalPrice).toFixed(2)} MAD
                  </div>
                  <div>
                    <span className="font-medium">
                      {t.pages.lots.pieceStatus?.label || 'Status'}:
                    </span>{' '}
                    {getPieceStatusBadge(piece.status)}
                  </div>
                </div>

                {piece.notes && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    {t.pages.lots.notes}: {piece.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const columns: TableColumn<Lot>[] = [
    {
      key: 'lotId',
      label: t.pages.lots.lotId,
      render: (lot) => <span className="font-medium">#{lot.lotId}</span>,
    },
    {
      key: 'companyName',
      label: t.pages.lots.companyName,
    },
    {
      key: 'companyCity',
      label: t.pages.lots.companyCity,
    },
    {
      key: 'totalQuantity',
      label: t.pages.lots.totalQuantity,
    },
    {
      key: 'totalPrice',
      label: t.pages.lots.totalPrice,
      render: (lot) => `${Number(lot.totalPrice).toFixed(2)} MAD`,
    },
    {
      key: 'status',
      label: t.pages.lots.status.label,
      render: (lot) => getStatusBadge(lot.status),
    },
    {
      key: 'createdAt',
      label: t.pages.lots.createdAt,
      render: (lot) => new Date(lot.createdAt).toLocaleDateString(locale),
    },
    {
      key: 'actions',
      label: t.common.actions,
      render: (lot) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleAddPiece(lot);
            }}
          >
            <Package className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(lot);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(lot.id);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  if (loading) {
    return <div className="text-center py-8">{t.common.loading}</div>;
  }

  return (
    <>
      <DataTable
        title=""
        data={filteredLots}
        columns={columns}
        searchKeys={['companyName', 'companyCity', 'lotId', 'notes']}
        searchPlaceholder={t.pages.lots.searchPlaceholder}
        emptyMessage={t.pages.lots.noData}
        searchValue={search}
        onSearchChange={setSearch}
        expandable={true}
        renderExpandedRow={renderExpandedRow}
        onRowExpand={handleRowExpand}
        customHeader={
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t.pages.lots.createLot}
          </Button>
        }
      />

      {/* Dialogs */}
      <CreateLotDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={fetchLots}
      />

      {selectedLot && (
        <>
          <CreateLotPieceDialog
            open={createPieceDialogOpen}
            onOpenChange={setCreatePieceDialogOpen}
            lotId={selectedLot.id}
            onSuccess={() => {
              // Refresh lot pieces
              lotsApi.getLotPiecesByLotId(selectedLot.id).then((response) => {
                setLotPieces((prev) => ({
                  ...prev,
                  [selectedLot.id]: response.pieces,
                }));
              });
              // Refresh lots to get updated totals
              fetchLots();
            }}
          />

          <EditLotDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            lot={selectedLot}
            onSuccess={fetchLots}
          />
        </>
      )}

      {selectedPiece && selectedLot && (
        <EditLotPieceDialog
          open={editPieceDialogOpen}
          onOpenChange={setEditPieceDialogOpen}
          piece={selectedPiece}
          onSuccess={() => {
            // Refresh lot pieces
            lotsApi.getLotPiecesByLotId(selectedLot.id).then((response) => {
              setLotPieces((prev) => ({
                ...prev,
                [selectedLot.id]: response.pieces,
              }));
            });
            // Refresh lots to get updated totals
            fetchLots();
          }}
        />
      )}
    </>
  );
}
