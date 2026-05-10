"use client";

import { useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { useLocale } from "@/components/local-lang-swither";
import { getMessages } from "@/lib/locale";
import { lotsApi, CreateLotDetailDto, Lot } from "@/services/api/lots";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NumberInput } from "@/components/ui/number-input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

interface CreateLotDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lot: Lot;
  onSuccess: () => void;
}

export function CreateLotDetailDialog({
  open,
  onOpenChange,
  lot,
  onSuccess,
}: CreateLotDetailDialogProps) {
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
  } = useForm<CreateLotDetailDto>({
    defaultValues: {
      lotId: lot.id,
      pieceDetails: [{ name: "", quantity: 1, status: "new", color: "#6366f1" }],
      quantityColor: "#3b82f6",
      priceColor: "#10b981",
      shippingCompanyColor: "#f59e0b",
      shippingCityColor: "#8b5cf6",
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

  const onSubmit = async (data: CreateLotDetailDto) => {
    try {
      setLoading(true);
      await lotsApi.createLotDetail({ ...data, lotId: lot.id });
      toast.success(t.pages.lots.createDetailSuccess);
      reset();
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Failed to create lot detail:", error);
      toast.error(t.pages.lots.createDetailError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {t.pages.lots.createDetail} - {t.pages.lots.lot} #{lot.lotId}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">{t.pages.lots.quantity}</Label>
              <div className="flex gap-2">
                <Controller
                  control={control}
                  name="quantity"
                  rules={{ required: t.common.required, min: { value: 1, message: t.pages.lots.minQuantity } }}
                  render={({ field }) => (
                    <NumberInput
                      id="quantity"
                      className="flex-1"
                      style={{ borderColor: quantityColor, borderWidth: '2px' }}
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      min={1}
                      placeholder="10"
                    />
                  )}
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
                <Controller
                  control={control}
                  name="price"
                  rules={{ required: t.common.required, min: { value: 0, message: t.pages.lots.minPrice } }}
                  render={({ field }) => (
                    <NumberInput
                      id="price"
                      className="flex-1"
                      style={{ borderColor: priceColor, borderWidth: '2px' }}
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      step={0.01}
                      min={0}
                      placeholder="299.99"
                    />
                  )}
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
                      <Controller
                        control={control}
                        name={`pieceDetails.${index}.quantity`}
                        rules={{ required: true, min: 1 }}
                        render={({ field }) => (
                          <NumberInput
                            value={field.value}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            min={1}
                            placeholder={t.pages.lots.qty}
                          />
                        )}
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
              {loading ? t.common.creating : t.common.create}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
