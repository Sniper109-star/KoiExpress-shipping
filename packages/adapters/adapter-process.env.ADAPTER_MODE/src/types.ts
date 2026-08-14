export type Address = {
  name?: string;
  company?: string;
  street1: string;
  street2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  phone?: string;
  email?: string;
};

export type Parcel = {
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
  weightKg?: number;
};

export type ShipmentInput = {
  from: Address;
  to: Address;
  parcels: Parcel[];
};

export type Rate = {
  id: string;
  carrier: string;
  service: string;
  currency: string;
  amountCents: number;
  estimatedDays?: number | null;
};

export type ShipmentRecord = {
  id: string;
  rates: Rate[];
  labelUrl?: string | null;
  trackingCode?: string | null;
};
