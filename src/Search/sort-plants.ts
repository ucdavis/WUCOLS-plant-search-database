import { Plant, WaterUseCode } from "../types";

const sortValueByWaterUseCode: {
  [key in WaterUseCode]: number;
} = {
  VL: 1,
  LO: 2,
  M: 3,
  H: 4,
  "?": 5,
  "/": 6,
  N: 7,
};

const getWaterUseSortValue = (code: WaterUseCode) => {
  return sortValueByWaterUseCode[code] || 99;
};

const sortPlants = (region: number) => (plants: Plant[]) =>
  plants.sort((plantA: Plant, plantB: Plant) => {
    let a = getWaterUseSortValue(plantA.waterUseByRegion[region - 1]);
    let b = getWaterUseSortValue(plantB.waterUseByRegion[region - 1]);
    return a < b ? -1 : a > b ? 1 : 0;
  });

export default sortPlants;
