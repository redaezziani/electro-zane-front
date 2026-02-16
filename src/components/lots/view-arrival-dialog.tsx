"use client";

import { useLocale } from "@/components/local-lang-swither";
import { getMessages } from "@/lib/locale";
import { LotArrival } from "@/services/api/lots";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface ViewArrivalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  arrival: LotArrival;
}

export function ViewArrivalDialog({ open, onOpenChange, arrival }: ViewArrivalDialogProps) {
  const { locale } = useLocale();
  const t = getMessages(locale);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {t.pages.lotArrivals.arrivalDetails || "Arrival Details"} #{arrival.arrivalId}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Shipment Information */}
          <div className="border-b pb-4">
            <h3 className="font-semibold mb-3">
              {t.pages.lotArrivals.shipmentInfo || "Shipment Information"}
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">
                  {t.pages.shipments?.shipmentId || "Shipment #"}
                </p>
                <p className="font-medium">#{arrival.shipment?.shipmentId || 'N/A'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">
                  {t.pages.shipments?.trackingNumber || "Tracking Number"}
                </p>
                <p className="font-medium">{arrival.shipment?.trackingNumber || 'N/A'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">
                  {t.pages.shipments?.shippingCompany || "Shipping Company"}
                </p>
                <p className="font-medium">{arrival.shippingCompany}</p>
              </div>
              <div>
                <p className="text-muted-foreground">
                  {t.pages.shipments?.shippingCity || "Shipping City"}
                </p>
                <p className="font-medium">{arrival.shippingCompanyCity}</p>
              </div>
            </div>
          </div>

          {/* Arrival Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t.pages.lotArrivals.quantity || "Quantity"}
              </p>
              <p className="text-lg">{arrival.quantity}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t.pages.lotArrivals.totalValue || "Total Value"}
              </p>
              <p className="text-lg">{Number(arrival.totalValue).toFixed(2)} MAD</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">
              {t.pages.lotArrivals.status?.label || "Status"}
            </p>
            <Badge>{arrival.status}</Badge>
          </div>

          {/* Piece Details with Expected vs Received */}
          {arrival.pieceDetails && arrival.pieceDetails.length > 0 && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">
                {t.pages.lotArrivals.pieceDetails || "Piece Details"}
              </p>
              <div className="space-y-2">
                {arrival.pieceDetails.map((piece, idx) => (
                  <div key={idx} className="border rounded p-3 text-sm">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">{piece.name}</span>
                      <Badge variant="outline" className={
                        (piece.quantityReceived || 0) < (piece.quantityExpected || 0)
                          ? "bg-orange-100 text-orange-800"
                          : (piece.quantityReceived || 0) > (piece.quantityExpected || 0)
                          ? "bg-purple-100 text-purple-800"
                          : "bg-green-100 text-green-800"
                      }>
                        {piece.status || 'N/A'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                      <div>
                        <span className="font-medium">
                          {t.pages.lotArrivals.quantityExpected || "Expected"}:
                        </span>{' '}
                        {piece.quantityExpected || 0}
                      </div>
                      <div>
                        <span className="font-medium">
                          {t.pages.lotArrivals.quantityReceived || "Received"}:
                        </span>{' '}
                        {piece.quantityReceived || 0}
                      </div>
                    </div>
                    {piece.notes && (
                      <div className="text-xs text-muted-foreground mt-2 pt-2 border-t">
                        {piece.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {arrival.notes && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">
                {t.pages.lotArrivals.notes || "Notes"}
              </p>
              <p className="text-sm border rounded p-3 bg-muted/50">{arrival.notes}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t.pages.lotArrivals.createdAt || "Created At"}
              </p>
              <p className="text-sm">
                {new Date(arrival.createdAt).toLocaleString(locale)}
              </p>
            </div>
            {arrival.verifiedAt && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t.pages.lotArrivals.verifiedAt || "Verified At"}
                </p>
                <p className="text-sm">
                  {new Date(arrival.verifiedAt).toLocaleString(locale)}
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
