import { axiosInstance } from '@/lib/utils';

// ============================================
// ENUMS
// ============================================

export enum LotStatus {
  PENDING = 'PENDING',
  IN_TRANSIT = 'IN_TRANSIT',
  ARRIVED = 'ARRIVED',
  VERIFIED = 'VERIFIED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum PieceStatus {
  NEW = 'NEW',
  USED = 'USED',
  REFURBISHED = 'REFURBISHED',
  DAMAGED = 'DAMAGED',
  AVAILABLE = 'AVAILABLE',
  SHIPPED = 'SHIPPED',
  ARRIVED = 'ARRIVED',
}

export enum ShipmentStatus {
  PENDING = 'PENDING',
  IN_TRANSIT = 'IN_TRANSIT',
  ARRIVED = 'ARRIVED',
  VERIFIED = 'VERIFIED',
  CANCELLED = 'CANCELLED',
}

export enum ArrivalStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  DAMAGED = 'DAMAGED',
  INCOMPLETE = 'INCOMPLETE',
  EXCESS = 'EXCESS',
}

// ============================================
// INTERFACES - LOT & LOT PIECES
// ============================================

export interface LotPiece {
  id: string;
  pieceId: number;
  lotId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: PieceStatus;
  color?: string;
  notes?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  lot?: Lot;
  shipmentPieces?: ShipmentPiece[];
}

export interface Lot {
  id: string;
  lotId: number;
  totalPrice: number;
  totalQuantity: number;
  companyName: string;
  companyCity: string;
  status: LotStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  pieces?: LotPiece[];
  arrivals?: LotArrival[];
}

export interface CreateLotDto {
  companyName: string;
  companyCity: string;
  notes?: string;
  status?: LotStatus;
}

export interface UpdateLotDto {
  companyName?: string;
  companyCity?: string;
  notes?: string;
  status?: LotStatus;
}

export interface CreateLotPieceDto {
  lotId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  status?: PieceStatus;
  color?: string;
  notes?: string;
  metadata?: any;
}

export interface UpdateLotPieceDto {
  name?: string;
  quantity?: number;
  unitPrice?: number;
  status?: PieceStatus;
  color?: string;
  notes?: string;
  metadata?: any;
}

export interface PieceDetailInput {
  name: string;
  quantity: number;
  status?: string;
  color?: string;
}

export interface CreateLotDetailDto {
  lotId: string;
  quantity: number;
  price: number;
  shippingCompany: string;
  shippingCompanyCity: string;
  pieceDetails: PieceDetailInput[];
  quantityColor?: string;
  priceColor?: string;
  shippingCompanyColor?: string;
  shippingCityColor?: string;
  notes?: string;
}

export interface UpdateLotDetailDto {
  quantity?: number;
  price?: number;
  shippingCompany?: string;
  shippingCompanyCity?: string;
  pieceDetails?: PieceDetailInput[];
  quantityColor?: string;
  priceColor?: string;
  shippingCompanyColor?: string;
  shippingCityColor?: string;
  notes?: string;
}

export interface LotDetail {
  id: string;
  detailId: number;
  lotId: string;
  quantity: number;
  price: number;
  shippingCompany: string;
  shippingCompanyCity: string;
  pieceDetails: PieceDetailInput[];
  quantityColor?: string;
  priceColor?: string;
  shippingCompanyColor?: string;
  shippingCityColor?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// INTERFACES - SHIPMENTS & SHIPMENT PIECES
// ============================================

export interface ShipmentPieceInput {
  lotPieceId: string;
  quantityShipped: number;
  notes?: string;
}

export interface ShipmentPiece {
  id: string;
  shipmentId: string;
  lotPieceId: string;
  quantityShipped: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  shipment?: Shipment;
  lotPiece?: LotPiece;
}

export interface Shipment {
  id: string;
  shipmentId: number;
  shippingCompany: string;
  shippingCompanyCity: string;
  status: ShipmentStatus;
  trackingNumber?: string;
  estimatedArrival?: string;
  actualArrival?: string;
  totalPieces: number;
  totalValue: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  pieces?: ShipmentPiece[];
  arrivals?: LotArrival[];
}

export interface CreateShipmentDto {
  shippingCompany: string;
  shippingCompanyCity: string;
  trackingNumber?: string;
  estimatedArrival?: string;
  notes?: string;
  status?: ShipmentStatus;
  pieces: ShipmentPieceInput[];
}

export interface UpdateShipmentDto {
  shippingCompany?: string;
  shippingCompanyCity?: string;
  trackingNumber?: string;
  estimatedArrival?: string;
  actualArrival?: string;
  notes?: string;
  status?: ShipmentStatus;
}

export interface CreateShipmentPieceDto {
  shipmentId: string;
  lotPieceId: string;
  quantityShipped: number;
  notes?: string;
}

export interface UpdateShipmentPieceDto {
  quantityShipped?: number;
  notes?: string;
}

// ============================================
// INTERFACES - LOT ARRIVALS
// ============================================

export interface ArrivalPieceDetail {
  name?: string;
  quantityExpected?: number;
  quantityReceived?: number;
  status?: string;
  notes?: string;
}

export interface LotArrival {
  id: string;
  arrivalId: number;
  lotId: string;
  shipmentId: string;
  quantity: number;
  totalValue: number;
  shippingCompany: string;
  shippingCompanyCity: string;
  pieceDetails: ArrivalPieceDetail[];
  status: ArrivalStatus;
  notes?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  lot?: Lot;
  shipment?: Shipment;
}

export interface CreateLotArrivalDto {
  shipmentId: string;
  quantity: number;
  totalValue: number;
  shippingCompany: string;
  shippingCompanyCity: string;
  pieceDetails: ArrivalPieceDetail[];
  status?: ArrivalStatus;
  notes?: string;
  verifiedBy?: string;
}

export interface UpdateLotArrivalDto {
  quantity?: number;
  totalValue?: number;
  shippingCompany?: string;
  shippingCompanyCity?: string;
  pieceDetails?: ArrivalPieceDetail[];
  status?: ArrivalStatus;
  notes?: string;
  verifiedBy?: string;
}

// ============================================
// PAGINATED RESPONSES
// ============================================

export interface PaginatedLotsResponse {
  lots: Lot[];
  total: number;
}

export interface PaginatedLotPiecesResponse {
  pieces: LotPiece[];
  total: number;
}

export interface PaginatedShipmentsResponse {
  shipments: Shipment[];
  total: number;
}

export interface PaginatedShipmentPiecesResponse {
  shipmentPieces: ShipmentPiece[];
  total: number;
}

export interface PaginatedLotArrivalsResponse {
  lotArrivals: LotArrival[];
  total: number;
}

// ============================================
// API OBJECT
// ============================================

export const lotsApi = {
  // ==================== LOTS ====================
  async getLots(page = 1, limit = 10, status?: LotStatus): Promise<PaginatedLotsResponse> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (status) params.append('status', status);

    const response = await axiosInstance.get<PaginatedLotsResponse>(`/lots?${params.toString()}`);
    return response.data;
  },

  async getLotById(id: string): Promise<Lot> {
    const response = await axiosInstance.get<Lot>(`/lots/${id}`);
    return response.data;
  },

  async getLotByLotId(lotId: number): Promise<Lot> {
    const response = await axiosInstance.get<Lot>(`/lots/lotId/${lotId}`);
    return response.data;
  },

  async createLot(data: CreateLotDto): Promise<Lot> {
    const response = await axiosInstance.post<Lot>('/lots', data);
    return response.data;
  },

  async updateLot(id: string, data: UpdateLotDto): Promise<Lot> {
    const response = await axiosInstance.patch<Lot>(`/lots/${id}`, data);
    return response.data;
  },

  async deleteLot(id: string): Promise<void> {
    await axiosInstance.delete(`/lots/${id}`);
  },

  // ==================== LOT PIECES ====================
  async getLotPieces(page = 1, limit = 10, lotId?: string, status?: PieceStatus): Promise<PaginatedLotPiecesResponse> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (lotId) params.append('lotId', lotId);
    if (status) params.append('status', status);

    const response = await axiosInstance.get<PaginatedLotPiecesResponse>(`/lot-pieces?${params.toString()}`);
    return response.data;
  },

  async getLotPiecesByLotId(lotId: string): Promise<PaginatedLotPiecesResponse> {
    const response = await axiosInstance.get<PaginatedLotPiecesResponse>(`/lot-pieces/lot/${lotId}`);
    return response.data;
  },

  async getLotPieceById(id: string): Promise<LotPiece> {
    const response = await axiosInstance.get<LotPiece>(`/lot-pieces/${id}`);
    return response.data;
  },

  async createLotPiece(data: CreateLotPieceDto): Promise<LotPiece> {
    const response = await axiosInstance.post<LotPiece>('/lot-pieces', data);
    return response.data;
  },

  async updateLotPiece(id: string, data: UpdateLotPieceDto): Promise<LotPiece> {
    const response = await axiosInstance.patch<LotPiece>(`/lot-pieces/${id}`, data);
    return response.data;
  },

  async deleteLotPiece(id: string): Promise<void> {
    await axiosInstance.delete(`/lot-pieces/${id}`);
  },

  async createLotDetail(data: CreateLotDetailDto): Promise<LotDetail> {
    const response = await axiosInstance.post<LotDetail>('/lot-details', data);
    return response.data;
  },

  async updateLotDetail(id: string, data: UpdateLotDetailDto): Promise<LotDetail> {
    const response = await axiosInstance.patch<LotDetail>(`/lot-details/${id}`, data);
    return response.data;
  },

  // ==================== SHIPMENTS ====================
  async getShipments(page = 1, limit = 10, status?: ShipmentStatus): Promise<PaginatedShipmentsResponse> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (status) params.append('status', status);

    const response = await axiosInstance.get<PaginatedShipmentsResponse>(`/shipments?${params.toString()}`);
    return response.data;
  },

  async getShipmentById(id: string): Promise<Shipment> {
    const response = await axiosInstance.get<Shipment>(`/shipments/${id}`);
    return response.data;
  },

  async getShipmentByShipmentId(shipmentId: number): Promise<Shipment> {
    const response = await axiosInstance.get<Shipment>(`/shipments/shipmentId/${shipmentId}`);
    return response.data;
  },

  async createShipment(data: CreateShipmentDto): Promise<Shipment> {
    const response = await axiosInstance.post<Shipment>('/shipments', data);
    return response.data;
  },

  async updateShipment(id: string, data: UpdateShipmentDto): Promise<Shipment> {
    const response = await axiosInstance.patch<Shipment>(`/shipments/${id}`, data);
    return response.data;
  },

  async deleteShipment(id: string): Promise<void> {
    await axiosInstance.delete(`/shipments/${id}`);
  },

  // ==================== SHIPMENT PIECES ====================
  async getShipmentPieces(page = 1, limit = 10, shipmentId?: string): Promise<PaginatedShipmentPiecesResponse> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (shipmentId) params.append('shipmentId', shipmentId);

    const response = await axiosInstance.get<PaginatedShipmentPiecesResponse>(`/shipment-pieces?${params.toString()}`);
    return response.data;
  },

  async getShipmentPiecesByShipmentId(shipmentId: string): Promise<PaginatedShipmentPiecesResponse> {
    const response = await axiosInstance.get<PaginatedShipmentPiecesResponse>(`/shipment-pieces/shipment/${shipmentId}`);
    return response.data;
  },

  async getShipmentPieceById(id: string): Promise<ShipmentPiece> {
    const response = await axiosInstance.get<ShipmentPiece>(`/shipment-pieces/${id}`);
    return response.data;
  },

  async createShipmentPiece(data: CreateShipmentPieceDto): Promise<ShipmentPiece> {
    const response = await axiosInstance.post<ShipmentPiece>('/shipment-pieces', data);
    return response.data;
  },

  async updateShipmentPiece(id: string, data: UpdateShipmentPieceDto): Promise<ShipmentPiece> {
    const response = await axiosInstance.patch<ShipmentPiece>(`/shipment-pieces/${id}`, data);
    return response.data;
  },

  async deleteShipmentPiece(id: string): Promise<void> {
    await axiosInstance.delete(`/shipment-pieces/${id}`);
  },

  // ==================== LOT ARRIVALS ====================
  async getLotArrivals(page = 1, limit = 10, lotId?: string, status?: ArrivalStatus): Promise<PaginatedLotArrivalsResponse> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (lotId) params.append('lotId', lotId);
    if (status) params.append('status', status);

    const response = await axiosInstance.get<PaginatedLotArrivalsResponse>(`/lot-arrivals?${params.toString()}`);
    return response.data;
  },

  async getLotArrivalById(id: string): Promise<LotArrival> {
    const response = await axiosInstance.get<LotArrival>(`/lot-arrivals/${id}`);
    return response.data;
  },

  async getLotArrivalsByLotId(lotId: string): Promise<LotArrival[]> {
    const response = await axiosInstance.get<LotArrival[]>(`/lot-arrivals/by-lot/${lotId}`);
    return response.data;
  },

  async getLotArrivalsByShipmentId(shipmentId: string): Promise<LotArrival[]> {
    const response = await axiosInstance.get<LotArrival[]>(`/lot-arrivals/by-shipment/${shipmentId}`);
    return response.data;
  },

  async createLotArrival(data: CreateLotArrivalDto): Promise<LotArrival> {
    const response = await axiosInstance.post<LotArrival>('/lot-arrivals', data);
    return response.data;
  },

  async updateLotArrival(id: string, data: UpdateLotArrivalDto): Promise<LotArrival> {
    const response = await axiosInstance.patch<LotArrival>(`/lot-arrivals/${id}`, data);
    return response.data;
  },

  async deleteLotArrival(id: string): Promise<void> {
    await axiosInstance.delete(`/lot-arrivals/${id}`);
  },
};
