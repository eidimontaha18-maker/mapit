export interface Zone {
  id: string;
  name: string;
  color: string;
  coordinates: [number, number][];
}

export type ZoneInput = Omit<Zone, 'id'>;
