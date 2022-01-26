import plantTypeCombinatorOptions from "../Plant/plant-type-combinator-options";
import { City, PlantType, SearchCriteria } from "../types";

type BoolDict = { [key: string]: boolean };
const autoSearch = false;

const fromQuerystring = (qs: string) => {
  let ps = new URLSearchParams(qs);
  return {
    pageNumber: parseInt(ps.get("p") || "") || 1,
    plantTypes: ps.getAll("t").reduce((dict: BoolDict, pt) => {
      dict[pt] = true;
      return dict;
    }, {}),
    name: (ps.get("n") || "").toLowerCase(),
    plantTypeCombinatorId: ps.get("tm") || "",
    cityId: parseInt(ps.get("c") || "0"),
    waterUseClassifications: ps.getAll("wu").reduce((dict: BoolDict, wu) => {
      dict[wu] = true;
      return dict;
    }, {}),
  };
};

const toQuerystring = (sc: SearchCriteria) => {
  let wu = Object.entries(sc.waterUseClassifications)
    .filter(([, selected]) => selected)
    .map(([code]) => code);
  let pt = Object.entries(sc.plantTypes)
    .filter(([, selected]) => selected)
    .map(([code]) => code);
  let ps = new URLSearchParams([
    ...(!sc.city ? [] : [["c", sc.city.id.toString()]]),
    //exclude default param values for terser URLs
    ...(!sc.name ? [] : [["n", sc.name]]),
    ...(sc.plantTypeCombinator === plantTypeCombinatorOptions.default
      ? []
      : [["tm", sc.plantTypeCombinator.value]]),
    ...wu.map((wu) => ["wu", wu]),
    ...pt.map((pt) => ["t", pt]),
    ...(sc.pageNumber === 1 ? [] : [["p", sc.pageNumber.toString()]]),
  ]);
  return ps.toString();
};

const getDefaultSearchCriteria = (plantTypes: PlantType[]) =>
  ({
    city: null as unknown as City,
    name: "",
    waterUseClassifications: {},
    plantTypes: plantTypes.reduce((dict: BoolDict, pt) => {
      dict[pt.code] = autoSearch ? pt.code === "A" : false;
      return dict;
    }, {}),
    pageNumber: 1,
    plantTypeCombinator: plantTypeCombinatorOptions.default,
  } as SearchCriteria);

const initSearchCriteria = (
  querystring: string,
  cityOptions: City[],
  plantTypes: PlantType[]
) => {
  let up = SearchCriteriaConverter.fromQuerystring(querystring);
  //console.log(up);
  let sc = getDefaultSearchCriteria(plantTypes);
  sc.waterUseClassifications = up.waterUseClassifications;
  sc.plantTypes = up.plantTypes;
  sc.name = up.name;
  sc.pageNumber = up.pageNumber;
  sc.city = cityOptions.filter((o) => o.id === up.cityId)[0] || sc.city;
  if (up.plantTypeCombinatorId in plantTypeCombinatorOptions.byId) {
    sc.plantTypeCombinator =
      plantTypeCombinatorOptions.byId[up.plantTypeCombinatorId];
  }
  return sc;
};

const SearchCriteriaConverter = {
  fromQuerystring: fromQuerystring,
  toQuerystring: toQuerystring,
  getDefaultSearchCriteria: getDefaultSearchCriteria,
  initSearchCriteria: initSearchCriteria,
};

export default SearchCriteriaConverter;
