export interface Material {
  name: string;
  unit: string;
  perSqm: number;
  unitCost: number;
  fixed?: number;
}

export interface Service {
  id: string;
  name: string;
  icon: string;
  type: string;
  desc: string;
  baseCostPerSqm: {
    materials: number;
    labor: number;
  };
  materials: Material[];
  duration: string;
  minSqm: number;
}

export interface Engineer {
  id: number;
  name: string;
  spec: string;
  avatar: string;
  exp: string;
  rate: number;
  rating: number;
  reviews: number;
  status: 'available' | 'busy';
  skills: string[];
  bio: string;
  userEmail?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'engineer' | 'customer';
  phone: string;
}

export interface Booking {
  id: string;
  client: string;
  service: string;
  engineer: string;
  area: number;
  total: number;
  status: 'Pending' | 'Confirmed' | 'Ongoing' | 'Completed' | 'Cancelled';
  date: string;
}

export interface CostBreakdown {
  mat: number;
  labor: number;
  fixed: number;
  vat: number;
  total: number;
  totalArea: number;
}

export interface BookingState {
  service: string | null;
  engineer: number | null;
  costBreakdown?: CostBreakdown;
}

export type PageId = 'home' | 'services' | 'engineers' | 'booking' | 'admin' | 'success';
