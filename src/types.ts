import { Url } from "url";

// these type aliases are just to make it more clear what sort of data is being passed around
export type NumericString = string;
export type TypeCode = string;
export type WaterUseCode = string;

export interface Region {
  id: NumericString;
  name: string;
}

export interface PlantType {
  code: string;
  name: string;
}

export interface WaterUseClassification {
  code: WaterUseCode;
  name: string;
  plantFactor: string;
  percentageET0: string;
}

export interface PhotoReference {
  url: Url;
  width: number;
  height: number;
}

export interface Photo {
  small: PhotoReference;
  large: PhotoReference;
  full: PhotoReference;
  filename: string;
  caption: string;
}

export interface Plant {
  id: number;
  url_keyword: string;
  botanicalName: string;
  photos: Photo[];
  commonName: string;
  types: TypeCode[];
  culturalInformation: string;
  waterUseByRegion: WaterUseCode[]; // number of elements is the number of regions
}

export interface Position {
  lat: number;
  lng: number;
}

export interface City {
  region: NumericString;
  name: string;
  id: number;
  position: Position;
}

export interface CityOption extends City {
  key: number;
  label: string;
  value: string;
}

export interface Point {
  x: number;
  y: number;
}

export interface BenchCardTemplate {
  name: string;
  id: string;
  sizeInInches: Point;
}

export interface Data {
  regions: Region[];
  plantTypes: PlantType[];
  waterUseClassifications: WaterUseClassification[];
  plants: Plant[];
  photos: Record<string, Photo>;
  cities: City[];
  benchCardTemplates: BenchCardTemplate[];
  plantTypeNameByCode: { [key: string]: string };
  waterUseByCode: { [key: string]: string };
  cityOptions: CityOption[];
}
