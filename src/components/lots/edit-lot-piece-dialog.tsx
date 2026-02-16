"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useLocale } from "@/components/local-lang-swither";
import { getMessages } from "@/lib/locale";
import { lotsApi, UpdateLotPieceDto, PieceStatus, LotPiece } from "@/services/api/lots";
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

interface EditLotPieceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  piece: LotPiece;
  onSuccess: () => void;
}

export function EditLotPieceDialog({
  open,
  onOpenChange,
  piece,
  onSuccess,
}: EditLotPieceDialogProps) {
  const { locale } = useLocale();
  const t = getMessages(locale);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<UpdateLotPieceDto>();

  useEffect(() => {
    if (piece) {
      reset({
        name: piece.name,
        quantity: piece.quantity,
        unitPrice: piece.unitPrice,
        status: piece.status,
        color: piece.color || "",
        notes: piece.notes || "",
      });
    }
  }, [piece, reset]);

  const quantity = watch("quantity");
  const unitPrice = watch("unitPrice");
  const totalPrice = quantity && unitPrice ? quantity * unitPrice : 0;

  const onSubmit = async (data: UpdateLotPieceDto) => {
    try {
      setLoading(true);
      await lotsApi.updateLotPiece(piece.id, data);
      toast.success(t.pages.lots.updatePieceSuccess || "Lot piece updated successfully");
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Failed to update lot piece:", error);
      toast.error(t.pages.lots.updatePieceError || "Failed to update lot piece");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {t.pages.lots.editPiece || "Edit Piece"} #{piece.pieceId}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t.pages.lots.pieceName || "Piece Name"}</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="S22 Ultra 256GB"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">{t.common.quantity}</Label>
              <Input
                id="quantity"
                type="number"
                {...register("quantity", {
                  valueAsNumber: true,
                  min: { value: 1, message: t.pages.lots.minQuantity || "Minimum quantity is 1" },
                })}
              />
              {errors.quantity && (
                <p className="text-sm text-destructive">{errors.quantity.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="unitPrice">{t.pages.lots.unitPrice || "Unit Price"}</Label>
              <Input
                id="unitPrice"
                type="number"
                step="0.01"
                {...register("unitPrice", {
                  valueAsNumber: true,
                  min: { value: 0, message: t.pages.lots.minPrice || "Minimum price is 0" },
                })}
              />
              {errors.unitPrice && (
                <p className="text-sm text-destructive">{errors.unitPrice.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t.pages.lots.totalPrice || "Total Price"}</Label>
            <div className="p-2 bg-muted rounded-md text-sm font-medium">
              {totalPrice.toFixed(2)}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">{t.pages.lots.pieceStatus?.label || "Status"}</Label>
            <Select
              value={watch("status")}
              onValueChange={(value) => setValue("status", value as PieceStatus)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={PieceStatus.NEW}>
                  {t.pages.lots.pieceStatus?.NEW || "New"}
                </SelectItem>
                <SelectItem value={PieceStatus.USED}>
                  {t.pages.lots.pieceStatus?.USED || "Used"}
                </SelectItem>
                <SelectItem value={PieceStatus.REFURBISHED}>
                  {t.pages.lots.pieceStatus?.REFURBISHED || "Refurbished"}
                </SelectItem>
                <SelectItem value={PieceStatus.AVAILABLE}>
                  {t.pages.lots.pieceStatus?.AVAILABLE || "Available"}
                </SelectItem>
                <SelectItem value={PieceStatus.SHIPPED}>
                  {t.pages.lots.pieceStatus?.SHIPPED || "Shipped"}
                </SelectItem>
                <SelectItem value={PieceStatus.ARRIVED}>
                  {t.pages.lots.pieceStatus?.ARRIVED || "Arrived"}
                </SelectItem>
                <SelectItem value={PieceStatus.DAMAGED}>
                  {t.pages.lots.pieceStatus?.DAMAGED || "Damaged"}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="color">{t.pages.lots.color || "Color (optional)"}</Label>
            <Input
              id="color"
              {...register("color")}
              type="color"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{t.pages.lots.notes}</Label>
            <Textarea
              id="notes"
              {...register("notes")}
              placeholder={t.pages.lots.notesPlaceholder}
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
