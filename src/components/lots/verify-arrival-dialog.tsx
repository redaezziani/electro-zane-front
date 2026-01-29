"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useLocale } from "@/components/local-lang-swither";
import { getMessages } from "@/lib/locale";
import { lotsApi, UpdateLotArrivalDto, LotArrival, ArrivalStatus } from "@/services/api/lots";
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
import { Trash2, Plus } from "lucide-react";

interface VerifyArrivalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  arrival: LotArrival;
  onSuccess: () => void;
}

export function VerifyArrivalDialog({
  open,
  onOpenChange,
  arrival,
  onSuccess,
}: VerifyArrivalDialogProps) {
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
    control,
  } = useForm<UpdateLotArrivalDto>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "pieceDetails",
  });

  // Watch color changes
  const quantityColor = watch("quantityColor");
  const priceColor = watch("priceColor");
  const shippingCompanyColor = watch("shippingCompanyColor");
  const shippingCityColor = watch("shippingCityColor");
  const pieceDetails = watch("pieceDetails");

  useEffect(() => {
    if (arrival) {
      reset({
        quantity: arrival.quantity,
        price: arrival.price,
        shippingCompany: arrival.shippingCompany,
        shippingCompanyCity: arrival.shippingCompanyCity,
        pieceDetails: arrival.pieceDetails || [],
        status: arrival.status,
        notes: arrival.notes || "",
        quantityColor: arrival.quantityColor || "#3b82f6",
        priceColor: arrival.priceColor || "#10b981",
        shippingCompanyColor: arrival.shippingCompanyColor || "#f59e0b",
        shippingCityColor: arrival.shippingCityColor || "#8b5cf6",
      });
    }
  }, [arrival, reset]);

  const onSubmit = async (data: UpdateLotArrivalDto) => {
    try {
      setLoading(true);
      await lotsApi.updateLotArrival(arrival.id, data);
      toast.success(t.pages.lotArrivals.updateSuccess);
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Failed to update lot arrival:", error);
      toast.error(t.pages.lotArrivals.updateError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {t.pages.lotArrivals.verifyArrival} #{arrival.arrivalId}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">{t.pages.lotArrivals.quantity}</Label>
              <div className="flex gap-2">
                <Input
                  id="quantity"
                  type="number"
                  className="flex-1"
                  style={{ borderColor: quantityColor, borderWidth: '2px' }}
                  {...register("quantity", { valueAsNumber: true })}
                />
                <Input
                  type="color"
                  className="w-16 h-10 cursor-pointer"
                  {...register("quantityColor")}
                  title="Pick a color"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">{t.pages.lotArrivals.price}</Label>
              <div className="flex gap-2">
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  className="flex-1"
                  style={{ borderColor: priceColor, borderWidth: '2px' }}
                  {...register("price", { valueAsNumber: true })}
                />
                <Input
                  type="color"
                  className="w-16 h-10 cursor-pointer"
                  {...register("priceColor")}
                  title="Pick a color"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="shippingCompany">{t.pages.lotArrivals.shippingCompany}</Label>
            <div className="flex gap-2">
              <Input
                id="shippingCompany"
                className="flex-1"
                style={{ borderColor: shippingCompanyColor, borderWidth: '2px' }}
                {...register("shippingCompany")}
              />
              <Input
                type="color"
                className="w-16 h-10 cursor-pointer"
                {...register("shippingCompanyColor")}
                title="Pick a color"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="shippingCompanyCity">{t.pages.lotArrivals.shippingCity}</Label>
            <div className="flex gap-2">
              <Input
                id="shippingCompanyCity"
                className="flex-1"
                style={{ borderColor: shippingCityColor, borderWidth: '2px' }}
                {...register("shippingCompanyCity")}
              />
              <Input
                type="color"
                className="w-16 h-10 cursor-pointer"
                {...register("shippingCityColor")}
                title="Pick a color"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">{t.pages.lotArrivals.status.label}</Label>
            <Select
              value={watch("status")}
              onValueChange={(value) => setValue("status", value as ArrivalStatus)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ArrivalStatus.PENDING}>{t.pages.lotArrivals.status.pending}</SelectItem>
                <SelectItem value={ArrivalStatus.VERIFIED}>{t.pages.lotArrivals.status.verified}</SelectItem>
                <SelectItem value={ArrivalStatus.DAMAGED}>{t.pages.lotArrivals.status.damaged}</SelectItem>
                <SelectItem value={ArrivalStatus.INCOMPLETE}>{t.pages.lotArrivals.status.incomplete}</SelectItem>
                <SelectItem value={ArrivalStatus.EXCESS}>{t.pages.lotArrivals.status.excess}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>{t.pages.lotArrivals.pieceDetails}</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ name: "", quantity: 0, status: "", color: "#6366f1" })}
              >
                <Plus className="h-4 w-4 mr-1" />
                {t.pages.lotArrivals.addPiece}
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
                        {...register(`pieceDetails.${index}.name`)}
                        placeholder={t.pages.lotArrivals.pieceName}
                      />
                    </div>
                    <div className="w-24">
                      <Input
                        type="number"
                        {...register(`pieceDetails.${index}.quantity`, { valueAsNumber: true })}
                        placeholder={t.pages.lotArrivals.qty}
                      />
                    </div>
                    <div className="w-32">
                      <Input
                        {...register(`pieceDetails.${index}.status`)}
                        placeholder={t.pages.lotArrivals.status.label}
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
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{t.pages.lotArrivals.notes}</Label>
            <Textarea
              id="notes"
              {...register("notes")}
              placeholder={t.pages.lotArrivals.notesPlaceholder}
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
              {loading ? t.common.updating : t.pages.lotArrivals.verify}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
