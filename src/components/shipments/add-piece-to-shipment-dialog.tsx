"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useLocale } from "@/components/local-lang-swither";
import { getMessages } from "@/lib/locale";
import { lotsApi, CreateShipmentPieceDto, Lot, LotPiece, PieceStatus } from "@/services/api/lots";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface AddPieceToShipmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shipmentId: string;
  onSuccess: () => void;
}

export function AddPieceToShipmentDialog({
  open,
  onOpenChange,
  shipmentId,
  onSuccess,
}: AddPieceToShipmentDialogProps) {
  const { locale } = useLocale();
  const t = getMessages(locale);
  const [loading, setLoading] = useState(false);
  const [lots, setLots] = useState<Lot[]>([]);
  const [lotPieces, setLotPieces] = useState<LotPiece[]>([]);
  const [selectedLotId, setSelectedLotId] = useState<string>("");
  const [loadingPieces, setLoadingPieces] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<CreateShipmentPieceDto>();

  useEffect(() => {
    if (open) {
      fetchLots();
      reset();
      setSelectedLotId("");
      setLotPieces([]);
    }
  }, [open, reset]);

  useEffect(() => {
    if (selectedLotId) {
      fetchLotPieces(selectedLotId);
      // Clear the selected piece when changing lots
      setValue("lotPieceId", "");
    } else {
      setLotPieces([]);
    }
  }, [selectedLotId, setValue]);

  const fetchLots = async () => {
    try {
      const response = await lotsApi.getLots(1, 100);
      setLots(response.lots);
    } catch (error) {
      console.error("Failed to fetch lots:", error);
      toast.error(t.pages.lots?.fetchError || "Failed to fetch lots");
    }
  };

  const fetchLotPieces = async (lotId: string) => {
    try {
      setLoadingPieces(true);
      const response = await lotsApi.getLotPiecesByLotId(lotId);
      // Filter pieces that have remaining quantity available to ship
      const shippablePieces = response.pieces.filter((p) => {
        const available = p.availableQuantity ?? p.quantity;
        return available > 0 && p.status !== PieceStatus.DAMAGED && p.status !== PieceStatus.ARRIVED;
      });
      setLotPieces(shippablePieces);
    } catch (error) {
      console.error("Failed to fetch lot pieces:", error);
      toast.error(t.pages.lots?.fetchPiecesError || "Failed to fetch pieces");
    } finally {
      setLoadingPieces(false);
    }
  };

  const selectedPiece = lotPieces.find((p) => p.id === watch("lotPieceId"));

  const onSubmit = async (data: CreateShipmentPieceDto) => {
    try {
      setLoading(true);
      await lotsApi.createShipmentPiece({
        ...data,
        shipmentId,
      });
      toast.success(t.pages.shipments?.addPieceSuccess || "Piece added to shipment successfully");
      reset();
      setSelectedLotId("");
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Failed to add piece to shipment:", error);
      toast.error(t.pages.shipments?.addPieceError || "Failed to add piece");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {t.pages.shipments?.addPiece || "Add Piece to Shipment"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="lot">{t.pages.lots?.selectLot || "Select Lot"}</Label>
            <Select value={selectedLotId} onValueChange={setSelectedLotId}>
              <SelectTrigger id="lot">
                <SelectValue placeholder={t.pages.lots?.selectLotPlaceholder || "Choose a lot"} />
              </SelectTrigger>
              <SelectContent>
                {lots.map((lot) => (
                  <SelectItem key={lot.id} value={lot.id}>
                    Lot #{lot.lotId} - {lot.companyName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedLotId && (
            <div className="space-y-2">
              <Label htmlFor="lotPieceId">{t.pages.lots?.selectPiece || "Select Piece"}</Label>
              {loadingPieces ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : lotPieces.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {t.pages.lots?.noAvailablePieces || "No available pieces in this lot"}
                </p>
              ) : (
                <Select
                  value={watch("lotPieceId")}
                  onValueChange={(value) => setValue("lotPieceId", value)}
                >
                  <SelectTrigger id="lotPieceId">
                    <SelectValue placeholder={t.pages.lots?.selectPiecePlaceholder || "Choose a piece"} />
                  </SelectTrigger>
                  <SelectContent>
                    {lotPieces.map((piece) => (
                      <SelectItem key={piece.id} value={piece.id}>
                        {piece.name} (Available: {piece.availableQuantity ?? piece.quantity})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {errors.lotPieceId && (
                <p className="text-sm text-destructive">{errors.lotPieceId.message}</p>
              )}
            </div>
          )}

          {selectedPiece && (
            <>
              <div className="space-y-2">
                <Label htmlFor="quantityShipped">
                  {t.pages.shipments?.quantityToShip || "Quantity to Ship"}
                </Label>
                <Input
                  id="quantityShipped"
                  type="number"
                  min={1}
                  max={selectedPiece.availableQuantity ?? selectedPiece.quantity}
                  {...register("quantityShipped", {
                    required: t.common.required,
                    valueAsNumber: true,
                    min: { value: 1, message: "Minimum quantity is 1" },
                    max: {
                      value: selectedPiece.availableQuantity ?? selectedPiece.quantity,
                      message: `Maximum available: ${selectedPiece.availableQuantity ?? selectedPiece.quantity}`,
                    },
                  })}
                  placeholder="1"
                />
                <p className="text-xs text-muted-foreground">
                  {t.pages.lots?.available || "Available"}: {selectedPiece.availableQuantity ?? selectedPiece.quantity}
                </p>
                {errors.quantityShipped && (
                  <p className="text-sm text-destructive">{errors.quantityShipped.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">{t.pages.shipments?.notes || "Notes (optional)"}</Label>
                <Textarea
                  id="notes"
                  {...register("notes")}
                  placeholder={t.pages.shipments?.notesPlaceholder || "Add any notes..."}
                  rows={2}
                />
              </div>
            </>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                setSelectedLotId("");
                onOpenChange(false);
              }}
              disabled={loading}
            >
              {t.common.cancel}
            </Button>
            <Button type="submit" disabled={loading || !selectedPiece}>
              {loading ? t.common.adding : t.common.add}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
