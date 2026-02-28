export type Coordinates = { latitude: number; longitude: number };

export type BoundingBox = {
  west: number;
  south: number;
  east: number;
  north: number;
};

export type Zone = {
  id: string;
  name: string;
  bounds: BoundingBox;
  downloadDate: string; // ISO 8601
  dataVersion: string;
  dataSourceDate: string; // ISO 8601
  sizeBytes: number;
  updateAvailable: boolean;
};
