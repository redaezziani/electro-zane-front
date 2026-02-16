"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useLocale } from "@/components/local-lang-swither";
import { getMessages } from "@/lib/locale";
import { lotsApi, CreateLotPieceDto, PieceStatus } from "@/services/api/lots";
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

interface CreateLotPieceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lotId: string;
  onSuccess: () => void;
}

export function CreateLotPieceDialog({
  open,
  onOpenChange,
  lotId,
  onSuccess,
}: CreateLotPieceDialogProps) {
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
  } = useForm<CreateLotPieceDto>({
    defaultValues: {
      lotId,
      status: PieceStatus.NEW,
    },
  });

  const quantity = watch("quantity");
  const unitPrice = watch("unitPrice");
  const totalPrice = quantity && unitPrice ? quantity * unitPrice : 0;

  useEffect(() => {
    setValue("lotId", lotId);
  }, [lotId, setValue]);

  const onSubmit = async (data: CreateLotPieceDto) => {
    try {
      setLoading(true);
      await lotsApi.createLotPiece(data);
      toast.success(t.pages.lots.createPieceSuccess || "Lot piece created successfully");
      reset({
        lotId,
        status: PieceStatus.NEW,
      });
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Failed to create lot piece:", error);
      toast.error(t.pages.lots.createPieceError || "Failed to create lot piece");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t.pages.lots.addPiece || "Add Piece to Lot"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t.pages.lots.pieceName || "Piece Name"}</Label>
            <Input
              id="name"
              {...register("name", { required: t.common.required })}
              placeholder="S22 Ultra 256GB"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">{t.common.quantity}</Label>
              <Input
                id="quantity"
                type="number"
                {...register("quantity", {
                  required: t.common.required,
                  valueAsNumber: true,
                  min: { value: 1, message: t.pages.lots.minQuantity || "Minimum quantity is 1" },
                })}
                placeholder="10"
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
                  required: t.common.required,
                  valueAsNumber: true,
                  min: { value: 0, message: t.pages.lots.minPrice || "Minimum price is 0" },
                })}
                placeholder="500.00"
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
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="color">{t.pages.lots.color || "Color (optional)"}</Label>
            <Input
              id="color"
              {...register("color")}
              placeholder="#FF5733"
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
              {loading ? t.common.creating : t.common.create}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
