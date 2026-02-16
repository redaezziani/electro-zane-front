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

  useEffect(() => {
    if (arrival) {
      reset({
        quantity: arrival.quantity,
        totalValue: arrival.totalValue,
        shippingCompany: arrival.shippingCompany,
        shippingCompanyCity: arrival.shippingCompanyCity,
        pieceDetails: arrival.pieceDetails || [],
        status: arrival.status,
        notes: arrival.notes || "",
      });
    }
  }, [arrival, reset]);

  const onSubmit = async (data: UpdateLotArrivalDto) => {
    try {
      setLoading(true);
      await lotsApi.updateLotArrival(arrival.id, data);
      toast.success(t.pages.lotArrivals.updateSuccess || "Arrival updated successfully");
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Failed to update lot arrival:", error);
      toast.error(t.pages.lotArrivals.updateError || "Failed to update arrival");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {t.pages.lotArrivals.verifyArrival || "Verify Arrival"} #{arrival.arrivalId}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Shipment Information */}
          <div className="border-b pb-4">
            <h3 className="font-semibold mb-3">
              {t.pages.lotArrivals.shipmentInfo || "Shipment Information"}
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-muted-foreground">
                  {t.pages.shipments?.shipmentId || "Shipment #"}:
                </span>{' '}
                #{arrival.shipment?.shipmentId || 'N/A'}
              </div>
              <div>
                <span className="font-medium text-muted-foreground">
                  {t.pages.shipments?.trackingNumber || "Tracking"}:
                </span>{' '}
                {arrival.shipment?.trackingNumber || 'N/A'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">
                {t.pages.lotArrivals.quantityReceived || "Quantity Received"}
              </Label>
              <Input
                id="quantity"
                type="number"
                {...register("quantity", {
                  valueAsNumber: true,
                  min: { value: 0, message: "Quantity must be 0 or greater" }
                })}
              />
              {errors.quantity && (
                <p className="text-sm text-destructive">{errors.quantity.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalValue">
                {t.pages.lotArrivals.totalValue || "Total Value"}
              </Label>
              <Input
                id="totalValue"
                type="number"
                step="0.01"
                {...register("totalValue", {
                  valueAsNumber: true,
                  min: { value: 0, message: "Value must be 0 or greater" }
                })}
              />
              {errors.totalValue && (
                <p className="text-sm text-destructive">{errors.totalValue.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="shippingCompany">
              {t.pages.lotArrivals.shippingCompany || "Shipping Company"}
            </Label>
            <Input
              id="shippingCompany"
              {...register("shippingCompany")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="shippingCompanyCity">
              {t.pages.lotArrivals.shippingCity || "Shipping City"}
            </Label>
            <Input
              id="shippingCompanyCity"
              {...register("shippingCompanyCity")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">{t.pages.lotArrivals.status?.label || "Status"}</Label>
            <Select
              value={watch("status")}
              onValueChange={(value) => setValue("status", value as ArrivalStatus)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ArrivalStatus.PENDING}>
                  {t.pages.lotArrivals.status?.pending || "Pending"}
                </SelectItem>
                <SelectItem value={ArrivalStatus.VERIFIED}>
                  {t.pages.lotArrivals.status?.verified || "Verified"}
                </SelectItem>
                <SelectItem value={ArrivalStatus.DAMAGED}>
                  {t.pages.lotArrivals.status?.damaged || "Damaged"}
                </SelectItem>
                <SelectItem value={ArrivalStatus.INCOMPLETE}>
                  {t.pages.lotArrivals.status?.incomplete || "Incomplete"}
                </SelectItem>
                <SelectItem value={ArrivalStatus.EXCESS}>
                  {t.pages.lotArrivals.status?.excess || "Excess"}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>
                {t.pages.lotArrivals.pieceDetails || "Piece Details"}
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({
                  name: "",
                  quantityExpected: 0,
                  quantityReceived: 0,
                  status: "",
                  notes: ""
                })}
              >
                <Plus className="h-4 w-4 mr-1" />
                {t.pages.lotArrivals.addPiece || "Add Piece"}
              </Button>
            </div>

            <div className="space-y-2 border rounded-lg p-3 max-h-[250px] overflow-y-auto">
              {fields.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {t.pages.lotArrivals.noPieces || "No pieces added yet"}
                </p>
              ) : (
                fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="border rounded p-3 space-y-2"
                  >
                    <div className="flex justify-between items-start">
                      <Input
                        {...register(`pieceDetails.${index}.name`)}
                        placeholder={t.pages.lotArrivals.pieceName || "Piece name"}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        className="ml-2"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        type="number"
                        {...register(`pieceDetails.${index}.quantityExpected`, { valueAsNumber: true })}
                        placeholder={t.pages.lotArrivals.quantityExpected || "Expected"}
                      />
                      <Input
                        type="number"
                        {...register(`pieceDetails.${index}.quantityReceived`, { valueAsNumber: true })}
                        placeholder={t.pages.lotArrivals.quantityReceived || "Received"}
                      />
                      <Input
                        {...register(`pieceDetails.${index}.status`)}
                        placeholder={t.pages.lotArrivals.status?.label || "Status"}
                      />
                    </div>
                    <Input
                      {...register(`pieceDetails.${index}.notes`)}
                      placeholder={t.pages.lotArrivals.notes || "Notes"}
                    />
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{t.pages.lotArrivals.notes || "Notes"}</Label>
            <Textarea
              id="notes"
              {...register("notes")}
              placeholder={t.pages.lotArrivals.notesPlaceholder || "Add any notes..."}
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
              {loading ? t.common.updating : (t.pages.lotArrivals.verify || "Verify")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
