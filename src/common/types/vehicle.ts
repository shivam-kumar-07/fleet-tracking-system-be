
export type VehicleStatus = 'moving' | 'idle' | 'stopped' | 'completed';
export interface Vehicle {
  id: string;
  lat: number;
  lng: number;
  speed: number;
  status: VehicleStatus;
  planned_distance_km?: number;
  distance_travelled_km?: number;
  total_distance_km?: number;
  progress?: number;
  updatedAt: string;
  eta?: string;
}

