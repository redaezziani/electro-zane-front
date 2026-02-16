"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useLocale } from "@/components/local-lang-swither";
import { getMessages } from "@/lib/locale";
import { lotsApi, UpdateShipmentPieceDto, ShipmentPiece } from "@/services/api/lots";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface EditShipmentPieceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shipmentPiece: ShipmentPiece;
  onSuccess: () => void;
}

export function EditShipmentPieceDialog({
  open,
  onOpenChange,
  shipmentPiece,
  onSuccess,
}: EditShipmentPieceDialogProps) {
  const { locale } = useLocale();
  const t = getMessages(locale);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateShipmentPieceDto>();

  useEffect(() => {
    if (shipmentPiece) {
      reset({
        quantityShipped: shipmentPiece.quantityShipped,
        notes: shipmentPiece.notes || "",
      });
    }
  }, [shipmentPiece, reset]);

  const onSubmit = async (data: UpdateShipmentPieceDto) => {
    try {
      setLoading(true);
      await lotsApi.updateShipmentPiece(shipmentPiece.id, data);
      toast.success(t.pages.shipments?.updatePieceSuccess || "Piece updated successfully");
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Failed to update shipment piece:", error);
      toast.error(t.pages.shipments?.updatePieceError || "Failed to update piece");
    } finally {
      setLoading(false);
    }
  };

  const maxQuantity = shipmentPiece.lotPiece?.quantity || 999;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {t.pages.shipments?.editPiece || "Edit Shipment Piece"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">
              {t.pages.lots?.pieceName || "Piece"}
            </Label>
            <div className="text-sm font-medium">
              {shipmentPiece.lotPiece?.name || "N/A"}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">
              {t.pages.lots?.lotId || "Lot"}
            </Label>
            <div className="text-sm font-medium">
              #{shipmentPiece.lotPiece?.lot?.lotId || "N/A"}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantityShipped">
              {t.pages.shipments?.quantityToShip || "Quantity Shipped"}
            </Label>
            <Input
              id="quantityShipped"
              type="number"
              min={1}
              max={maxQuantity}
              {...register("quantityShipped", {
                required: t.common.required,
                valueAsNumber: true,
                min: { value: 1, message: "Minimum quantity is 1" },
                max: {
                  value: maxQuantity,
                  message: `Maximum available: ${maxQuantity}`,
                },
              })}
            />
            <p className="text-xs text-muted-foreground">
              {t.pages.lots?.available || "Available"}: {maxQuantity}
            </p>
            {errors.quantityShipped && (
              <p className="text-sm text-destructive">{errors.quantityShipped.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{t.pages.shipments?.notes || "Notes"}</Label>
            <Textarea
              id="notes"
              {...register("notes")}
              placeholder={t.pages.shipments?.notesPlaceholder || "Add any notes..."}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              {t.common.cancel}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t.common.updating : t.common.update}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
