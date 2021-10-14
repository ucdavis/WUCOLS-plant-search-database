
const getWaterUseSortValue = (() => {
  const sortValueByWaterUseCode = { 'VL': 1, 'LO': 2, 'M': 3, 'H': 4, '?': 5, '/': 6 };
  return code => {
    return sortValueByWaterUseCode[code] || 99;
  };
})();

const sortPlants = region => plants => 
    plants.sort((plantA,plantB) => {
        let a = getWaterUseSortValue(plantA.waterUseByRegion[region - 1]);
        let b = getWaterUseSortValue(plantB.waterUseByRegion[region - 1]);
        return a < b ? -1 : a > b ? 1 : 0;
    });

export default sortPlants;