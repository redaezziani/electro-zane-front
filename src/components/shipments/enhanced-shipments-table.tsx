'use client';

import { useState, useEffect } from 'react';
import { DataTable, TableColumn } from '@/components/shared/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import { useLocale } from '@/components/local-lang-swither';
import { getMessages } from '@/lib/locale';
import {
  lotsApi,
  Shipment,
  ShipmentStatus,
  ShipmentPiece,
} from '@/services/api/lots';
import { toast } from 'sonner';
import { CreateShipmentDialog } from './create-shipment-dialog';
import { EditShipmentDialog } from './edit-shipment-dialog';
import { AddPieceToShipmentDialog } from './add-piece-to-shipment-dialog';
import { EditShipmentPieceDialog } from './edit-shipment-piece-dialog';

interface EnhancedShipmentsTableProps {
  statusFilter?: ShipmentStatus | 'ALL';
  startDate?: Date;
  endDate?: Date;
}

export function EnhancedShipmentsTable({
  statusFilter,
  startDate,
  endDate,
}: EnhancedShipmentsTableProps) {
  const { locale } = useLocale();
  const t = getMessages(locale);

  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [filteredShipments, setFilteredShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [shipmentPieces, setShipmentPieces] = useState<
    Record<string, ShipmentPiece[]>
  >({});
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addPieceDialogOpen, setAddPieceDialogOpen] = useState(false);
  const [editPieceDialogOpen, setEditPieceDialogOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(
    null,
  );
  const [selectedPiece, setSelectedPiece] = useState<ShipmentPiece | null>(null);
  const [search, setSearch] = useState('');

  const fetchShipments = async () => {
    try {
      setLoading(true);
      const response = await lotsApi.getShipments(
        1,
        100,
        statusFilter && statusFilter !== 'ALL' ? statusFilter : undefined,
      );
      setShipments(response.shipments);
    } catch (error) {
      console.error('Failed to fetch shipments:', error);
      toast.error(t.pages.shipments?.fetchError || 'Failed to fetch shipments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, [statusFilter]);

  // Filter shipments by date range and search
  useEffect(() => {
    let filtered = shipments;

    if (startDate) {
      filtered = filtered.filter((shipment) => {
        const shipmentDate = shipment.estimatedArrival
          ? new Date(shipment.estimatedArrival)
          : new Date(shipment.createdAt);
        return shipmentDate >= startDate;
      });
    }

    if (endDate) {
      filtered = filtered.filter((shipment) => {
        const shipmentDate = shipment.estimatedArrival
          ? new Date(shipment.estimatedArrival)
          : new Date(shipment.createdAt);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        return shipmentDate <= end;
      });
    }

    // Filter by search term
    if (search) {
      filtered = filtered.filter((shipment) => {
        return (
          shipment.shippingCompany
            ?.toLowerCase()
            .includes(search.toLowerCase()) ||
          shipment.shippingCompanyCity
            ?.toLowerCase()
            .includes(search.toLowerCase()) ||
          shipment.trackingNumber
            ?.toLowerCase()
            .includes(search.toLowerCase()) ||
          shipment.shipmentId?.toString().includes(search)
        );
      });
    }

    setFilteredShipments(filtered);
  }, [shipments, startDate, endDate, search]);

  const getStatusBadge = (status: ShipmentStatus) => {
    const statusConfig = {
      PENDING: {
        variant: 'secondary' as const,
        className: 'bg-yellow-500 text-white border-yellow-600 hover:bg-yellow-600',
        label: t.pages.shipments?.status?.PENDING || 'Pending',
      },
      IN_TRANSIT: {
        variant: 'default' as const,
        className: 'bg-blue-500 text-white border-blue-600 hover:bg-blue-600',
        label: t.pages.shipments?.status?.IN_TRANSIT || 'In Transit',
      },
      ARRIVED: {
        variant: 'outline' as const,
        className: 'bg-green-500 text-white border-green-600 hover:bg-green-600',
        label: t.pages.shipments?.status?.ARRIVED || 'Arrived',
      },
      VERIFIED: {
        variant: 'outline' as const,
        className: 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700',
        label: t.pages.shipments?.status?.VERIFIED || 'Verified',
      },
      CANCELLED: {
        variant: 'destructive' as const,
        className: '',
        label: t.pages.shipments?.status?.CANCELLED || 'Cancelled',
      },
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>;
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        t.pages.shipments?.confirmDelete ||
          'Are you sure you want to delete this shipment?',
      )
    )
      return;

    try {
      await lotsApi.deleteShipment(id);
      toast.success(
        t.pages.shipments?.deleteSuccess || 'Shipment deleted successfully',
      );
      fetchShipments();
    } catch (error) {
      console.error('Failed to delete shipment:', error);
      toast.error(
        t.pages.shipments?.deleteError || 'Failed to delete shipment',
      );
    }
  };

  const handleEdit = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setEditDialogOpen(true);
  };

  const handleAddPiece = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setAddPieceDialogOpen(true);
  };

  const handleEditPiece = (piece: ShipmentPiece) => {
    setSelectedPiece(piece);
    setEditPieceDialogOpen(true);
  };

  const handleDeletePiece = async (shipmentId: string, pieceId: string) => {
    if (
      !confirm(
        t.pages.shipments?.confirmDeletePiece ||
          'Are you sure you want to remove this piece?',
      )
    )
      return;

    try {
      await lotsApi.deleteShipmentPiece(pieceId);
      toast.success(
        t.pages.shipments?.deletePieceSuccess || 'Piece removed successfully',
      );

      // Refresh shipment pieces
      const response = await lotsApi.getShipmentPiecesByShipmentId(shipmentId);
      setShipmentPieces((prev) => ({
        ...prev,
        [shipmentId]: response.shipmentPieces,
      }));

      // Refresh shipments to get updated totals
      fetchShipments();
    } catch (error) {
      console.error('Failed to delete shipment piece:', error);
      toast.error(
        t.pages.shipments?.deletePieceError || 'Failed to remove piece',
      );
    }
  };

  const handleRowExpand = async (shipment: Shipment) => {
    if (!shipmentPieces[shipment.id]) {
      try {
        const response = await lotsApi.getShipmentPiecesByShipmentId(
          shipment.id,
        );
        setShipmentPieces((prev) => ({
          ...prev,
          [shipment.id]: response.shipmentPieces,
        }));
      } catch (error) {
        console.error('Failed to fetch shipment pieces:', error);
        toast.error(
          t.pages.shipments?.fetchPiecesError || 'Failed to fetch pieces',
        );
      }
    }
  };

  const renderExpandedRow = (shipment: Shipment) => {
    const pieces = shipmentPieces[shipment.id];

    return (
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">
            {t.pages.shipments?.pieces || 'Pieces in Shipment'}
          </h3>
          <Button size="sm" onClick={() => handleAddPiece(shipment)}>
            <Plus className="h-4 w-4 mr-2" />
            {t.pages.shipments?.addPiece || 'Add Piece'}
          </Button>
        </div>

        {!pieces || pieces.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t.pages.shipments?.noPieces || 'No pieces in this shipment'}
          </p>
        ) : (
          <div className="space-y-2 bg-background rounded-md shadow">
            {pieces.map((piece) => (
              <div key={piece.id} className=" p-3 ">
                <div className="flex justify-between items-start">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm flex-1">
                    <div>
                      <span className="font-medium">
                        {t.pages.lots?.lotId || 'Lot'}:
                      </span>{' '}
                      #{piece.lotPiece?.lot?.lotId || 'N/A'}
                    </div>
                    <div className="md:col-span-2">
                      <span className="font-medium">
                        {t.pages.lots?.pieceName || 'Piece'}:
                      </span>{' '}
                      {piece.lotPiece?.name || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">{t.common.quantity}:</span>{' '}
                      {piece.quantityShipped}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditPiece(piece)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePiece(shipment.id, piece.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                {piece.notes && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    {t.pages.shipments?.notes || 'Notes'}: {piece.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const columns: TableColumn<Shipment>[] = [
    {
      key: 'shipmentId',
      label: t.pages.shipments?.shipmentId || 'Shipment #',
      render: (shipment) => (
        <span className="font-medium">#{shipment.shipmentId}</span>
      ),
    },
    {
      key: 'shippingCompany',
      label: t.pages.shipments?.shippingCompany || 'Shipping Company',
    },
    {
      key: 'status',
      label: t.pages.shipments?.status?.label || 'Status',
      render: (shipment) => getStatusBadge(shipment.status),
    },
    {
      key: 'totalPieces',
      label: t.pages.shipments?.totalPieces || 'Total Pieces',
    },
    {
      key: 'totalValue',
      label: t.pages.shipments?.totalValue || 'Total Value',
      render: (shipment) => `${Number(shipment.totalValue).toFixed(2)} MAD`,
    },
    {
      key: 'estimatedArrival',
      label: t.pages.shipments?.estimatedArrival || 'Est. Arrival',
      render: (shipment) =>
        shipment.estimatedArrival
          ? new Date(shipment.estimatedArrival).toLocaleDateString(locale)
          : '-',
    },
    {
      key: 'actions',
      label: t.common.actions,
      render: (shipment) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleAddPiece(shipment);
            }}
          >
            <Package className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(shipment);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(shipment.id);
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
        data={filteredShipments}
        columns={columns}
        searchKeys={[
          'shippingCompany',
          'shippingCompanyCity',
          'trackingNumber',
          'shipmentId',
        ]}
        searchPlaceholder={
          t.pages.shipments?.searchPlaceholder || 'Search shipments...'
        }
        emptyMessage={t.pages.shipments?.noData || 'No shipments found'}
        searchValue={search}
        onSearchChange={setSearch}
        expandable={true}
        renderExpandedRow={renderExpandedRow}
        onRowExpand={handleRowExpand}
        customHeader={
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t.pages.shipments?.createShipment || 'Create Shipment'}
          </Button>
        }
      />

      {/* Dialogs */}
      <CreateShipmentDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={fetchShipments}
      />

      {selectedShipment && (
        <>
          <EditShipmentDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            shipment={selectedShipment}
            onSuccess={fetchShipments}
          />

          <AddPieceToShipmentDialog
            open={addPieceDialogOpen}
            onOpenChange={setAddPieceDialogOpen}
            shipmentId={selectedShipment.id}
            onSuccess={() => {
              // Refresh shipment pieces
              lotsApi
                .getShipmentPiecesByShipmentId(selectedShipment.id)
                .then((response) => {
                  setShipmentPieces((prev) => ({
                    ...prev,
                    [selectedShipment.id]: response.shipmentPieces,
                  }));
                });
              // Refresh shipments to get updated totals
              fetchShipments();
            }}
          />
        </>
      )}

      {selectedPiece && (
        <EditShipmentPieceDialog
          open={editPieceDialogOpen}
          onOpenChange={setEditPieceDialogOpen}
          shipmentPiece={selectedPiece}
          onSuccess={() => {
            // Refresh shipment pieces for the shipment this piece belongs to
            if (selectedPiece.shipmentId) {
              lotsApi
                .getShipmentPiecesByShipmentId(selectedPiece.shipmentId)
                .then((response) => {
                  setShipmentPieces((prev) => ({
                    ...prev,
                    [selectedPiece.shipmentId]: response.shipmentPieces,
                  }));
                });
            }
            // Refresh shipments to get updated totals
            fetchShipments();
          }}
        />
      )}
    </>
  );
}
