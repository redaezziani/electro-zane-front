"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useLocale } from "@/components/local-lang-swither";
import { getMessages } from "@/lib/locale";
import { lotsApi, UpdateLotDetailDto, LotDetail } from "@/services/api/lots";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

interface EditLotDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lotDetail: LotDetail;
  onSuccess: () => void;
}

export function EditLotDetailDialog({
  open,
  onOpenChange,
  lotDetail,
  onSuccess,
}: EditLotDetailDialogProps) {
  const { locale } = useLocale();
  const t = getMessages(locale);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    watch,
  } = useForm<UpdateLotDetailDto>({
    defaultValues: {
      quantity: lotDetail.quantity,
      price: lotDetail.price,
      shippingCompany: lotDetail.shippingCompany,
      shippingCompanyCity: lotDetail.shippingCompanyCity,
      pieceDetails: lotDetail.pieceDetails || [{ name: "", quantity: 1, status: "new" }],
      notes: lotDetail.notes || "",
      quantityColor: lotDetail.quantityColor || "#3b82f6",
      priceColor: lotDetail.priceColor || "#10b981",
      shippingCompanyColor: lotDetail.shippingCompanyColor || "#f59e0b",
      shippingCityColor: lotDetail.shippingCityColor || "#8b5cf6",
    },
  });

  // Watch color changes
  const quantityColor = watch("quantityColor");
  const priceColor = watch("priceColor");
  const shippingCompanyColor = watch("shippingCompanyColor");
  const shippingCityColor = watch("shippingCityColor");
  const pieceDetails = watch("pieceDetails");

  const { fields, append, remove } = useFieldArray({
    control,
    name: "pieceDetails",
  });

  // Reset form when lotDetail changes
  useEffect(() => {
    reset({
      quantity: lotDetail.quantity,
      price: lotDetail.price,
      shippingCompany: lotDetail.shippingCompany,
      shippingCompanyCity: lotDetail.shippingCompanyCity,
      pieceDetails: lotDetail.pieceDetails || [{ name: "", quantity: 1, status: "new" }],
      notes: "", // Always start with empty note field for new input
      quantityColor: lotDetail.quantityColor || "#3b82f6",
      priceColor: lotDetail.priceColor || "#10b981",
      shippingCompanyColor: lotDetail.shippingCompanyColor || "#f59e0b",
      shippingCityColor: lotDetail.shippingCityColor || "#8b5cf6",
    });
  }, [lotDetail, reset]);

  const onSubmit = async (data: UpdateLotDetailDto) => {
    try {
      setLoading(true);
      await lotsApi.updateLotDetail(lotDetail.id, data);
      toast.success("Lot detail updated successfully");
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Failed to update lot detail:", error);
      toast.error("Failed to update lot detail");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {t.pages.lots.editDetail || "Edit Detail"} #{lotDetail.detailId}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">{t.pages.lots.quantity}</Label>
              <div className="flex gap-2">
                <Input
                  id="quantity"
                  type="number"
                  className="flex-1"
                  style={{ borderColor: quantityColor, borderWidth: '2px' }}
                  {...register("quantity", {
                    required: t.common.required,
                    valueAsNumber: true,
                    min: { value: 1, message: t.pages.lots.minQuantity },
                  })}
                  placeholder="10"
                />
                <Input
                  type="color"
                  className="w-16 h-10 cursor-pointer"
                  {...register("quantityColor")}
                  title="Pick a color"
                />
              </div>
              {errors.quantity && (
                <p className="text-sm text-destructive">{errors.quantity.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">{t.pages.lots.price}</Label>
              <div className="flex gap-2">
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  className="flex-1"
                  style={{ borderColor: priceColor, borderWidth: '2px' }}
                  {...register("price", {
                    required: t.common.required,
                    valueAsNumber: true,
                    min: { value: 0, message: t.pages.lots.minPrice },
                  })}
                  placeholder="299.99"
                />
                <Input
                  type="color"
                  className="w-16 h-10 cursor-pointer"
                  {...register("priceColor")}
                  title="Pick a color"
                />
              </div>
              {errors.price && (
                <p className="text-sm text-destructive">{errors.price.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="shippingCompany">{t.pages.lots.shippingCompany}</Label>
            <div className="flex gap-2">
              <Input
                id="shippingCompany"
                className="flex-1"
                style={{ borderColor: shippingCompanyColor, borderWidth: '2px' }}
                {...register("shippingCompany", { required: t.common.required })}
                placeholder="FedEx"
              />
              <Input
                type="color"
                className="w-16 h-10 cursor-pointer"
                {...register("shippingCompanyColor")}
                title="Pick a color"
              />
            </div>
            {errors.shippingCompany && (
              <p className="text-sm text-destructive">{errors.shippingCompany.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="shippingCompanyCity">{t.pages.lots.shippingCity}</Label>
            <div className="flex gap-2">
              <Input
                id="shippingCompanyCity"
                className="flex-1"
                style={{ borderColor: shippingCityColor, borderWidth: '2px' }}
                {...register("shippingCompanyCity", { required: t.common.required })}
                placeholder="Los Angeles"
              />
              <Input
                type="color"
                className="w-16 h-10 cursor-pointer"
                {...register("shippingCityColor")}
                title="Pick a color"
              />
            </div>
            {errors.shippingCompanyCity && (
              <p className="text-sm text-destructive">{errors.shippingCompanyCity.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>{t.pages.lots.pieceDetails}</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ name: "", quantity: 1, status: "new", color: "#6366f1" })}
              >
                <Plus className="h-4 w-4 mr-1" />
                {t.pages.lots.addPiece}
              </Button>
            </div>

            <div className="space-y-2 border rounded-lg p-3 max-h-[200px] overflow-y-auto">
              {fields.map((field, index) => {
                const pieceColor = pieceDetails?.[index]?.color || "#6366f1";
                return (
                  <div
                    key={field.id}
                    className="flex gap-2 items-start p-2 rounded border-2"
                    style={{ borderColor: pieceColor }}
                  >
                    <div className="flex-1">
                      <Input
                        {...register(`pieceDetails.${index}.name`, { required: true })}
                        placeholder={t.pages.lots.pieceName}
                      />
                    </div>
                    <div className="w-24">
                      <Input
                        type="number"
                        {...register(`pieceDetails.${index}.quantity`, {
                          required: true,
                          valueAsNumber: true,
                          min: 1,
                        })}
                        placeholder={t.pages.lots.qty}
                      />
                    </div>
                    <div className="w-32">
                      <Input
                        {...register(`pieceDetails.${index}.status`)}
                        placeholder={t.pages.lots.status.label}
                      />
                    </div>
                    <Input
                      type="color"
                      className="w-12 h-10 cursor-pointer"
                      {...register(`pieceDetails.${index}.color`)}
                      title="Pick a color"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
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
              {loading ? t.common.updating || "Updating..." : t.common.update || "Update"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
