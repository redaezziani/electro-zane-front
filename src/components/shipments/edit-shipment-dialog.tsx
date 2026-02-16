"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useLocale } from "@/components/local-lang-swither";
import { getMessages } from "@/lib/locale";
import { lotsApi, UpdateShipmentDto, ShipmentStatus, Shipment } from "@/services/api/lots";
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

interface EditShipmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shipment: Shipment;
  onSuccess: () => void;
}

export function EditShipmentDialog({
  open,
  onOpenChange,
  shipment,
  onSuccess,
}: EditShipmentDialogProps) {
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
  } = useForm<UpdateShipmentDto>();

  useEffect(() => {
    if (shipment) {
      reset({
        shippingCompany: shipment.shippingCompany,
        shippingCompanyCity: shipment.shippingCompanyCity,
        trackingNumber: shipment.trackingNumber || "",
        estimatedArrival: shipment.estimatedArrival
          ? new Date(shipment.estimatedArrival).toISOString().slice(0, 16)
          : "",
        actualArrival: shipment.actualArrival
          ? new Date(shipment.actualArrival).toISOString().slice(0, 16)
          : "",
        status: shipment.status,
        notes: shipment.notes || "",
      });
    }
  }, [shipment, reset]);

  const onSubmit = async (data: UpdateShipmentDto) => {
    try {
      setLoading(true);

      // Convert datetime-local format to ISO 8601
      const payload: UpdateShipmentDto = {
        ...data,
        estimatedArrival: data.estimatedArrival
          ? new Date(data.estimatedArrival).toISOString()
          : undefined,
        actualArrival: data.actualArrival
          ? new Date(data.actualArrival).toISOString()
          : undefined,
      };

      await lotsApi.updateShipment(shipment.id, payload);
      toast.success(t.pages.shipments?.updateSuccess || "Shipment updated successfully");
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Failed to update shipment:", error);
      toast.error(t.pages.shipments?.updateError || "Failed to update shipment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {t.pages.shipments?.editShipment || "Edit Shipment"} #{shipment.shipmentId}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="shippingCompany">
                {t.pages.shipments?.shippingCompany || "Shipping Company"}
              </Label>
              <Input
                id="shippingCompany"
                {...register("shippingCompany")}
                placeholder="DHL Express"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shippingCompanyCity">
                {t.pages.shipments?.shippingCity || "Shipping City"}
              </Label>
              <Input
                id="shippingCompanyCity"
                {...register("shippingCompanyCity")}
                placeholder="Dubai"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="trackingNumber">
                {t.pages.shipments?.trackingNumber || "Tracking Number"}
              </Label>
              <Input
                id="trackingNumber"
                {...register("trackingNumber")}
                placeholder="TRACK123456"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">{t.pages.shipments?.status?.label || "Status"}</Label>
              <Select
                value={watch("status")}
                onValueChange={(value) => setValue("status", value as ShipmentStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ShipmentStatus.PENDING}>
                    {t.pages.shipments?.status?.PENDING || "Pending"}
                  </SelectItem>
                  <SelectItem value={ShipmentStatus.IN_TRANSIT}>
                    {t.pages.shipments?.status?.IN_TRANSIT || "In Transit"}
                  </SelectItem>
                  <SelectItem value={ShipmentStatus.ARRIVED}>
                    {t.pages.shipments?.status?.ARRIVED || "Arrived"}
                  </SelectItem>
                  <SelectItem value={ShipmentStatus.VERIFIED}>
                    {t.pages.shipments?.status?.VERIFIED || "Verified"}
                  </SelectItem>
                  <SelectItem value={ShipmentStatus.CANCELLED}>
                    {t.pages.shipments?.status?.CANCELLED || "Cancelled"}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estimatedArrival">
                {t.pages.shipments?.estimatedArrival || "Estimated Arrival"}
              </Label>
              <Input
                id="estimatedArrival"
                type="datetime-local"
                {...register("estimatedArrival")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="actualArrival">
                {t.pages.shipments?.actualArrival || "Actual Arrival"}
              </Label>
              <Input
                id="actualArrival"
                type="datetime-local"
                {...register("actualArrival")}
              />
            </div>
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
