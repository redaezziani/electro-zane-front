'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { useOrdersStore } from '@/stores/orders-store';
import { useProductsStore } from '@/stores/products-store';
import { toast } from 'sonner';
import { Loader } from '../loader';
import { useUserLocation } from '@/hooks/use-user-location';
import DeliveryMapPicker from '../delivery-map-picker';
import { useLocale } from '@/components/local-lang-swither';
import { getMessages } from '@/lib/locale';
import { useBarcodeScanner } from '@/hooks/use-barcode-scanner';

interface CreateOrderDialogProps {
  trigger?: React.ReactNode;
  isOpen?: boolean;
  onClose?: () => void;
}

export function CreateOrderDialog({
  trigger,
  isOpen: externalIsOpen,
  onClose: externalOnClose,
}: CreateOrderDialogProps) {
  const { locale } = useLocale();
  const lang = getMessages(locale);
  const t = lang.pages?.orders?.dialogs?.createOrder || {};

  const { createOrder, loading } = useOrdersStore();
  const { products, fetchProducts } = useProductsStore();
  const [internalIsOpen, setInternalIsOpen] = useState(false);

  const {
    lat,
    lng,
    place,
    loading: locationLoading,
    error: locationError,
  } = useUserLocation();

  const isDialogOpen =
    externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsDialogOpen =
    externalOnClose !== undefined
      ? (open: boolean) => {
          if (!open) externalOnClose();
        }
      : setInternalIsOpen;

  // Form state
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    customerAddress: {},
    items: [{ skuId: '', quantity: 1, sellPrice: undefined as number | undefined, imei: '' }],
    deliveryLat: lat ?? undefined,
    deliveryLng: lng ?? undefined,
    deliveryPlace: place || '',
    notes: '',
    trackingNumber: '',
    language: (locale || 'en') as string,
  });

  const [errors, setErrors] = useState({
    items: [{ skuId: '', quantity: '', sellPrice: '', imei: '' }],
  });

  useEffect(() => {
    if (isDialogOpen) {
      fetchProducts();
    }
  }, [isDialogOpen, fetchProducts]);

  useEffect(() => {
    if (lat && lng) {
      setFormData((prev) => ({
        ...prev,
        deliveryLat: prev.deliveryLat ?? lat,
        deliveryLng: prev.deliveryLng ?? lng,
        deliveryPlace: prev.deliveryPlace || place || '',
      }));
    }
  }, [lat, lng, place]);

  // Barcode scanning functionality
  const handleBarcodeScanned = async (barcode: string) => {
    console.log('🔍 Barcode scanned:', barcode);
    console.log('📅 Scan timestamp:', new Date().toISOString());

    // Search for SKU by barcode
    let foundSku = null;
    let foundProduct = null;

    for (const product of products) {
      for (const variant of product.variants || []) {
        for (const sku of variant.skus || []) {
          // Check both barcode and SKU code for matches
          if (sku.barcode === barcode || sku.sku === barcode) {
            foundSku = sku;
            foundProduct = product;
            break;
          }
        }
        if (foundSku) break;
      }
      if (foundSku) break;
    }

    if (foundSku && foundProduct) {
      console.log(
        '✅ Product found:',
        foundProduct.name,
        '- SKU:',
        foundSku.sku,
      );

      // Check if SKU is already in items
      const existingItemIndex = formData.items.findIndex(
        (item) => item.skuId === foundSku.id,
      );

      if (existingItemIndex !== -1) {
        console.log('📈 Incrementing quantity for existing item');
        // Increment quantity if already exists
        setFormData((prev) => ({
          ...prev,
          items: prev.items.map((item, idx) =>
            idx === existingItemIndex
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          ),
        }));
        toast.success(
          (
            t.toast?.barcodeQuantityIncreased ||
            '{productName} - {sku} quantity increased'
          )
            .replace('{productName}', foundProduct.name)
            .replace('{sku}', foundSku.sku),
        );
      } else {
        console.log('➕ Adding new item to order');
        // Add new item or update first empty slot
        const emptyIndex = formData.items.findIndex((item) => !item.skuId);
        if (emptyIndex !== -1) {
          // Fill empty slot
          setFormData((prev) => ({
            ...prev,
            items: prev.items.map((item, idx) =>
              idx === emptyIndex ? { skuId: foundSku.id, quantity: 1, sellPrice: undefined, imei: '' } : item,
            ),
          }));
        } else {
          // Add new item
          setFormData((prev) => ({
            ...prev,
            items: [...prev.items, { skuId: foundSku.id, quantity: 1, sellPrice: undefined, imei: '' }],
          }));
          setErrors((prev) => ({
            ...prev,
            items: [...prev.items, { skuId: '', quantity: '', sellPrice: '', imei: '' }],
          }));
        }
        toast.success(
          (t.toast?.barcodeAdded || '{productName} - {sku} added to order')
            .replace('{productName}', foundProduct.name)
            .replace('{sku}', foundSku.sku),
        );
      }
    } else {
      console.log('❌ Product not found for barcode:', barcode);
      toast.error(
        (
          t.toast?.barcodeNotFound ||
          'Product with barcode "{barcode}" not found'
        ).replace('{barcode}', barcode),
      );
    }
  };

  // Enable global barcode scanner when dialog is open
  useBarcodeScanner({
    onScan: handleBarcodeScanned,
    minLength: 3,
  });

  const handleItemChange = (idx: number, field: string, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === idx ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const addOrderItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { skuId: '', quantity: 1, sellPrice: undefined, imei: '' }],
    }));
    setErrors((prev) => ({
      ...prev,
      items: [...prev.items, { skuId: '', quantity: '', sellPrice: '', imei: '' }],
    }));
  };

  const removeOrderItem = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx),
    }));
    setErrors((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = {
      items: formData.items.map(() => ({ skuId: '', quantity: '', sellPrice: '', imei: '' })),
    };

    formData.items.forEach((item, idx) => {
      if (!item.skuId) newErrors.items[idx].skuId = t.errors?.skuRequired;
      if (!item.quantity || item.quantity < 1)
        newErrors.items[idx].quantity = t.errors?.quantityMin;

      // Check if product is a phone and IMEI is required
      const selectedProduct = products.find(p =>
        p.variants?.some(v => v.skus?.some(s => s.id === item.skuId))
      );
      const isPhone = selectedProduct?.categories?.some(cat =>
        cat.name.toLowerCase().includes('phone')
      );
      if (isPhone && item.imei && item.imei.length !== 15) {
        newErrors.items[idx].imei = 'IMEI must be 15 digits';
      }
    });

    setErrors(newErrors);

    if (
      newErrors.items.some((itemErr) => itemErr.skuId || itemErr.quantity || itemErr.imei)
    )
      return;

    try {
      const payload = {
        customerName: formData.customerName || undefined,
        customerPhone: formData.customerPhone || undefined,
        customerEmail: formData.customerEmail || undefined,
        customerAddress:
          Object.keys(formData.customerAddress).length > 0
            ? formData.customerAddress
            : undefined,
        items: formData.items.map((item) => ({
          skuId: item.skuId,
          quantity: item.quantity,
          sellPrice: item.sellPrice || undefined,
          imei: item.imei || undefined,
        })),
        deliveryLat: formData.deliveryLat,
        deliveryLng: formData.deliveryLng,
        deliveryPlace: formData.deliveryPlace,
        notes: formData.notes,
        trackingNumber: formData.trackingNumber,
        language: formData.language,
      };

      // @ts-expect-error - Backend doesn't require all Order fields, calculates them server-side
      const id = await createOrder(payload);
      toast.success(t.toast?.success);
      setFormData({
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        customerAddress: {},
        items: [{ skuId: '', quantity: 1, sellPrice: undefined, imei: '' }],
        deliveryLat: lat ?? undefined,
        deliveryLng: lng ?? undefined,
        deliveryPlace: place || '',
        notes: '',
        trackingNumber: '',
        language: (locale || 'en') as string,
      });
      setErrors({
        items: [{ skuId: '', quantity: '', sellPrice: '', imei: '' }],
      });
      setIsDialogOpen(false);
    } catch (error) {
      toast.error(t.toast?.failed);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            {t.trigger || 'Add Order'}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[750px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t.title || 'Create New Order'}</DialogTitle>
          <DialogDescription>
            {t.description ||
              'Add a new order. You can add multiple items and delivery details.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Customer Information */}
          <div className="space-y-4 border rounded-md p-4 ">
            <h3 className="font-medium">
              {t.sections?.customer || 'Customer Information'}
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">
                  {t.fields?.customerName || 'Customer Name'} (
                  {t.optional || 'Optional'})
                </Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      customerName: e.target.value,
                    }))
                  }
                  placeholder={
                    t.placeholders?.customerName || 'Enter customer name'
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerPhone">
                  {t.fields?.customerPhone || 'Customer Phone'} (
                  {t.optional || 'Optional'})
                </Label>
                <Input
                  id="customerPhone"
                  value={formData.customerPhone}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      customerPhone: e.target.value,
                    }))
                  }
                  placeholder={
                    t.placeholders?.customerPhone || 'Enter phone number'
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerEmail">
                {t.fields?.customerEmail || 'Customer Email'} (
                {t.optional || 'Optional'})
              </Label>
              <Input
                id="customerEmail"
                type="email"
                value={formData.customerEmail}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    customerEmail: e.target.value,
                  }))
                }
                placeholder={
                  t.placeholders?.customerEmail || 'Enter email address'
                }
              />
            </div>
          </div>

          {/* Invoice Language */}
          <div className="space-y-2">
            <Label htmlFor="language">Invoice Language</Label>
            <Select
              value={formData.language}
              onValueChange={(val) =>
                setFormData((prev) => ({ ...prev, language: val }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ar">Arabic (العربية)</SelectItem>
                <SelectItem value="fr">French (Français)</SelectItem>
                <SelectItem value="es">Spanish (Español)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Barcode Scanner Status */}
          <div className="space-y-2 border rounded-md p-3 bg-muted/30">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              <Label className="text-sm font-medium">
                {t.fields?.barcode || 'Barcode Scanner Active'}
              </Label>
            </div>
            <p className="text-sm text-muted-foreground">
              {t.hints?.barcodeScanner ||
                'Scan a product barcode to quickly add it to the order'}
            </p>
          </div>

          {/* Order Items */}
          <div className="space-y-2">
            <Label>{t.sections?.orderItems || 'Order Items'}</Label>
            {formData.items.map((item, idx) => {
              // Get selected SKU price to display
              const selectedSku = products
                .flatMap(p => p.variants?.flatMap(v => v.skus || []) || [])
                .find(s => s.id === item.skuId);

              return (
              <div key={idx} className="border rounded-md p-3 mb-2 space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2 w-full">
                    <Label>{t.fields?.sku || 'SKU'}</Label>
                    <Select
                      value={item.skuId}
                      onValueChange={(val) =>
                        handleItemChange(idx, 'skuId', val)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue
                          placeholder={
                            t.placeholders?.selectSKU || 'Select SKU'
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {products
                          .map(
                            (prod) =>
                              prod.variants?.flatMap(
                                (variant) =>
                                  variant.skus?.map((sku) => (
                                    <SelectItem key={sku.id} value={sku.id}>
                                      {prod.name} {variant.name ? `- ${variant.name}` : ''} - Stock: {sku.stock} - {sku.price} MAD
                                    </SelectItem>
                                  )) || [],
                              ) || [],
                          )
                          .flat()}
                      </SelectContent>
                    </Select>
                    {errors.items[idx]?.skuId && (
                      <p className="text-sm text-destructive">
                        {errors.items[idx].skuId}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>{t.fields?.quantity || 'Quantity'}</Label>
                    <Input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(
                          idx,
                          'quantity',
                          parseInt(e.target.value) || 1,
                        )
                      }
                    />
                    {errors.items[idx]?.quantity && (
                      <p className="text-sm text-destructive">
                        {errors.items[idx].quantity}
                      </p>
                    )}
                  </div>
                </div>

                {/* Sell Price Field */}
                {selectedSku && (
                  <div className="space-y-2">
                    <Label htmlFor={`sellPrice-${idx}`}>
                      {t.fields?.sellPrice || 'Custom Sell Price'} ({t.optional || 'Optional'})
                      <span className="text-xs text-muted-foreground ml-2">
                        {t.fields?.defaultPrice || 'Default'}: {selectedSku.price} MAD
                      </span>
                    </Label>
                    <Input
                      id={`sellPrice-${idx}`}
                      type="number"
                      step="0.01"
                      min={0}
                      value={item.sellPrice || ''}
                      onChange={(e) =>
                        handleItemChange(
                          idx,
                          'sellPrice',
                          e.target.value ? parseFloat(e.target.value) : undefined,
                        )
                      }
                      placeholder={t.placeholders?.sellPrice || `Leave empty to use ${selectedSku.price} MAD`}
                    />
                    {errors.items[idx]?.sellPrice && (
                      <p className="text-sm text-destructive">
                        {errors.items[idx].sellPrice}
                      </p>
                    )}
                  </div>
                )}

                {/* IMEI field for phones */}
                {(() => {
                  const selectedProduct = products.find(p =>
                    p.variants?.some(v => v.skus?.some(s => s.id === item.skuId))
                  );
                  const isPhone = selectedProduct?.categories?.some(cat =>
                    cat.name.toLowerCase().includes('phone')
                  );

                  if (isPhone) {
                    return (
                      <div className="space-y-2">
                        <Label htmlFor={`imei-${idx}`}>IMEI (15 digits)</Label>
                        <Input
                          id={`imei-${idx}`}
                          type="text"
                          maxLength={15}
                          value={item.imei}
                          onChange={(e) =>
                            handleItemChange(idx, 'imei', e.target.value)
                          }
                          placeholder="Enter IMEI number"
                        />
                        {errors.items[idx]?.imei && (
                          <p className="text-sm text-destructive">
                            {errors.items[idx].imei}
                          </p>
                        )}
                      </div>
                    );
                  }
                  return null;
                })()}

                <div className="flex justify-end gap-2">
                  {formData.items.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => removeOrderItem(idx)}
                    >
                      {t.actions?.removeItem || 'Remove'}
                    </Button>
                  )}
                  {idx === formData.items.length - 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addOrderItem}
                    >
                      {t.actions?.addItem || 'Add Item'}
                    </Button>
                  )}
                </div>
              </div>
            );
            })}
          </div>

          {/* Delivery */}
          <div className="space-y-2">
            <Label>
              {t.sections?.delivery || 'Delivery Location (Optional)'}
            </Label>
            {locationLoading ? (
              <p className="text-sm text-muted-foreground">
                {t.status?.detectingLocation || 'Detecting location...'}
              </p>
            ) : (
              <DeliveryMapPicker
                deliveryLat={formData.deliveryLat}
                deliveryLng={formData.deliveryLng}
                deliveryPlace={formData.deliveryPlace}
                onChange={(data) =>
                  setFormData((prev) => ({
                    ...prev,
                    deliveryLat: data.lat,
                    deliveryLng: data.lng,
                    deliveryPlace: data.place,
                  }))
                }
              />
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">{t.sections?.notes || 'Notes'}</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              rows={2}
            />
          </div>

          {/* Tracking */}
          <div className="space-y-2">
            <Label htmlFor="trackingNumber">
              {t.sections?.trackingNumber || 'Tracking Number'}
            </Label>
            <Input
              id="trackingNumber"
              value={formData.trackingNumber}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  trackingNumber: e.target.value,
                }))
              }
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
            >
              {t.actions?.cancel || 'Cancel'}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader className="mr-2 h-4 w-4" />{' '}
                  {t.actions?.creating || 'Creating...'}
                </>
              ) : (
                t.actions?.create || 'Create Order'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
