import React from "react";

// these type aliases are just to make it more clear what sort of data is being passed around
export type NumericString = string;
export type TypeCode = string;
export type WaterUseCode = "VL" | "LO" | "M" | "H" | "U" | "NA";
export type BoolDict = { [key: string]: boolean };

export interface Region {
  id: number;
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
  url: string;
  width: number;
  height: number;
}

export interface Photo {
  small: PhotoReference;
  // large: PhotoReference;
  // full: PhotoReference;
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
  searchName: string;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface City {
  region: number;
  name: string;
  id: number;
  position: Coordinates;
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
  photos: { [key: string]: Photo };
  cities: City[];
  benchCardTemplates: BenchCardTemplate[];
  plantTypeNameByCode: { [key: string]: string };
  waterUseByCode: { [key: string]: WaterUseClassification };
  cityOptions: CityOption[];
}

export interface PlantTypeCombinator {
  label: string;
  value: string;
  fn: (a: any, b: any) => boolean; // doesn't appear to be used anywhere
}

export interface PlantTypeCombinatorOptions {
  default: PlantTypeCombinator;
  array: PlantTypeCombinator[];
  byId: { [key: string]: PlantTypeCombinator };
}

export interface SearchCriteria {
  city: City;
  name: string;
  waterUseClassifications: BoolDict;
  plantTypes: BoolDict;
  pageNumber: number;
  plantTypeCombinator: PlantTypeCombinator;
}

export interface DownloadAction {
  method: () => void;
  include: boolean;
  label: React.ReactElement;
}

export interface WucolsBlobLink {
  cachedBlobUrl: string;
}
