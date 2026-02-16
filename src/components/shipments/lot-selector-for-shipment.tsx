"use client";

import { useState, useEffect } from "react";
import { useLocale } from "@/components/local-lang-swither";
import { getMessages } from "@/lib/locale";
import { lotsApi, Lot, LotPiece, PieceStatus, ShipmentPieceInput } from "@/services/api/lots";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface LotSelectorForShipmentProps {
  selectedPieces: ShipmentPieceInput[];
  onPiecesChange: (pieces: ShipmentPieceInput[]) => void;
}

export function LotSelectorForShipment({
  selectedPieces,
  onPiecesChange,
}: LotSelectorForShipmentProps) {
  const { locale } = useLocale();
  const t = getMessages(locale);

  const [lots, setLots] = useState<Lot[]>([]);
  const [lotPieces, setLotPieces] = useState<Record<string, LotPiece[]>>({});
  const [expandedLots, setExpandedLots] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLots();
  }, []);

  const fetchLots = async () => {
    try {
      setLoading(true);
      const response = await lotsApi.getLots(1, 100);
      setLots(response.lots);
    } catch (error) {
      console.error("Failed to fetch lots:", error);
      toast.error(t.pages.lots?.fetchError || "Failed to fetch lots");
    } finally {
      setLoading(false);
    }
  };

  const fetchLotPieces = async (lotId: string) => {
    if (lotPieces[lotId]) return; // Already fetched

    try {
      const response = await lotsApi.getLotPiecesByLotId(lotId);
      // Filter pieces that can be shipped (not already SHIPPED, ARRIVED, or DAMAGED)
      const shippablePieces = response.pieces.filter(
        (p) => p.status === PieceStatus.NEW ||
               p.status === PieceStatus.USED ||
               p.status === PieceStatus.REFURBISHED ||
               p.status === PieceStatus.AVAILABLE
      );
      setLotPieces((prev) => ({ ...prev, [lotId]: shippablePieces }));
    } catch (error) {
      console.error("Failed to fetch lot pieces:", error);
      toast.error(t.pages.lots?.fetchPiecesError || "Failed to fetch pieces");
    }
  };

  const toggleLot = async (lotId: string) => {
    const newExpanded = new Set(expandedLots);
    if (newExpanded.has(lotId)) {
      newExpanded.delete(lotId);
    } else {
      newExpanded.add(lotId);
      await fetchLotPieces(lotId);
    }
    setExpandedLots(newExpanded);
  };

  const isPieceSelected = (pieceId: string) => {
    return selectedPieces.some((p) => p.lotPieceId === pieceId);
  };

  const getPieceQuantity = (pieceId: string) => {
    const piece = selectedPieces.find((p) => p.lotPieceId === pieceId);
    return piece?.quantityShipped || 0;
  };

  const handlePieceToggle = (piece: LotPiece, checked: boolean) => {
    if (checked) {
      // Add piece with default quantity of 1
      onPiecesChange([
        ...selectedPieces,
        {
          lotPieceId: piece.id,
          quantityShipped: 1,
          notes: "",
        },
      ]);
    } else {
      // Remove piece
      onPiecesChange(selectedPieces.filter((p) => p.lotPieceId !== piece.id));
    }
  };

  const handleQuantityChange = (pieceId: string, quantity: number) => {
    onPiecesChange(
      selectedPieces.map((p) =>
        p.lotPieceId === pieceId ? { ...p, quantityShipped: quantity } : p
      )
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>{t.common.loading}</span>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto border rounded-lg p-4">
      {lots.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          {t.pages.lots?.noData || "No lots found"}
        </p>
      ) : (
        lots.map((lot) => (
          <div key={lot.id} className="border rounded-lg">
            <div
              className="p-3 cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => toggleLot(lot.id)}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="font-medium">
                    {t.pages.lots?.lotId || "Lot"} #{lot.lotId}
                  </span>
                  <Badge variant="outline">{lot.companyName}</Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  {expandedLots.has(lot.id) ? "▼" : "▶"}
                </div>
              </div>
            </div>

            {expandedLots.has(lot.id) && (
              <div className="border-t p-3 space-y-2 bg-muted/20">
                {!lotPieces[lot.id] ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : lotPieces[lot.id].length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-2">
                    {t.pages.lots?.noAvailablePieces || "No available pieces in this lot"}
                  </p>
                ) : (
                  lotPieces[lot.id].map((piece) => (
                    <div
                      key={piece.id}
                      className="flex items-center gap-3 p-2 border rounded bg-background"
                    >
                      <Checkbox
                        checked={isPieceSelected(piece.id)}
                        onCheckedChange={(checked) =>
                          handlePieceToggle(piece, checked as boolean)
                        }
                      />
                      <div className="flex-1 grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <span className="font-medium">{piece.name}</span>
                        </div>
                        <div className="text-muted-foreground">
                          {t.pages.lots?.available || "Available"}: {piece.quantity}
                        </div>
                        <div className="text-muted-foreground">
                          {Number(piece.unitPrice).toFixed(2)} MAD
                        </div>
                      </div>
                      {isPieceSelected(piece.id) && (
                        <div className="w-24">
                          <Input
                            type="number"
                            min={1}
                            max={piece.quantity}
                            value={getPieceQuantity(piece.id)}
                            onChange={(e) =>
                              handleQuantityChange(piece.id, parseInt(e.target.value) || 1)
                            }
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
