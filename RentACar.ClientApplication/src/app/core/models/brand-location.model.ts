export interface Brand {
  id: number;
  name: string;
  logoUrl?: string;
}

export interface Location {
  id: number;
  name: string;
  city: string;
  address?: string;
  phone?: string;
}