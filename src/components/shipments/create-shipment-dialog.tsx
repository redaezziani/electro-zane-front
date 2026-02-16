"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useLocale } from "@/components/local-lang-swither";
import { getMessages } from "@/lib/locale";
import { lotsApi, CreateShipmentDto, ShipmentPieceInput, ShipmentStatus } from "@/services/api/lots";
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
import { LotSelectorForShipment } from "./lot-selector-for-shipment";

interface CreateShipmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateShipmentDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateShipmentDialogProps) {
  const { locale } = useLocale();
  const t = getMessages(locale);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedPieces, setSelectedPieces] = useState<ShipmentPieceInput[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CreateShipmentDto>({
    defaultValues: {
      status: ShipmentStatus.PENDING,
      pieces: [],
    },
  });

  const onSubmit = async (data: CreateShipmentDto) => {
    if (selectedPieces.length === 0) {
      toast.error(t.pages.shipments?.noPiecesSelected || "Please select at least one piece");
      return;
    }

    try {
      setLoading(true);

      // Convert datetime-local format to ISO 8601
      const shipmentData: CreateShipmentDto = {
        ...data,
        estimatedArrival: data.estimatedArrival
          ? new Date(data.estimatedArrival).toISOString()
          : undefined,
        actualArrival: data.actualArrival
          ? new Date(data.actualArrival).toISOString()
          : undefined,
        pieces: selectedPieces,
      };

      await lotsApi.createShipment(shipmentData);
      toast.success(t.pages.shipments?.createSuccess || "Shipment created successfully");
      reset();
      setSelectedPieces([]);
      setStep(1);
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Failed to create shipment:", error);
      toast.error(t.pages.shipments?.createError || "Failed to create shipment");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    reset();
    setSelectedPieces([]);
    setStep(1);
    onOpenChange(false);
  };

  const totalPieces = selectedPieces.reduce((sum, p) => sum + p.quantityShipped, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {t.pages.shipments?.createShipment || "Create Shipment"} - Step {step}/2
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {step === 1 ? (
            <>
              {/* Step 1: Shipping Information */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="shippingCompany">
                      {t.pages.shipments?.shippingCompany || "Shipping Company"}
                    </Label>
                    <Input
                      id="shippingCompany"
                      {...register("shippingCompany", { required: t.common.required })}
                      placeholder="DHL Express"
                    />
                    {errors.shippingCompany && (
                      <p className="text-sm text-destructive">{errors.shippingCompany.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shippingCompanyCity">
                      {t.pages.shipments?.shippingCity || "Shipping City"}
                    </Label>
                    <Input
                      id="shippingCompanyCity"
                      {...register("shippingCompanyCity", { required: t.common.required })}
                      placeholder="Dubai"
                    />
                    {errors.shippingCompanyCity && (
                      <p className="text-sm text-destructive">{errors.shippingCompanyCity.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="trackingNumber">
                      {t.pages.shipments?.trackingNumber || "Tracking Number (optional)"}
                    </Label>
                    <Input
                      id="trackingNumber"
                      {...register("trackingNumber")}
                      placeholder="TRACK123456"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="estimatedArrival">
                      {t.pages.shipments?.estimatedArrival || "Estimated Arrival (optional)"}
                    </Label>
                    <Input
                      id="estimatedArrival"
                      type="datetime-local"
                      {...register("estimatedArrival")}
                    />
                  </div>
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
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">{t.pages.shipments?.notes || "Notes (optional)"}</Label>
                  <Textarea
                    id="notes"
                    {...register("notes")}
                    placeholder={t.pages.shipments?.notesPlaceholder || "Add any notes..."}
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  {t.common.cancel}
                </Button>
                <Button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={loading}
                >
                  {t.common.next || "Next"}
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Step 2: Select Pieces */}
              <div className="space-y-4">
                <div className="border-b pb-3">
                  <h3 className="font-semibold">
                    {t.pages.shipments?.selectPieces || "Select Pieces from Lots"}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t.pages.shipments?.selectPiecesDescription || "Choose which pieces to include in this shipment"}
                  </p>
                </div>

                <LotSelectorForShipment
                  selectedPieces={selectedPieces}
                  onPiecesChange={setSelectedPieces}
                />

                {selectedPieces.length > 0 && (
                  <div className="border rounded-lg p-4 bg-muted/30">
                    <h4 className="font-semibold mb-2">
                      {t.pages.shipments?.selectedPieces || "Selected Pieces"}: {selectedPieces.length}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {t.pages.shipments?.totalPieces || "Total Pieces"}: {totalPieces}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  disabled={loading}
                >
                  {t.common.back || "Back"}
                </Button>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    {t.common.cancel}
                  </Button>
                  <Button type="submit" disabled={loading || selectedPieces.length === 0}>
                    {loading ? t.common.creating : t.common.create}
                  </Button>
                </div>
              </div>
            </>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
