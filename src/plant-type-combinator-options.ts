import { PlantTypeCombinator, PlantTypeCombinatorOptions } from "./types";

const combinators: PlantTypeCombinator[] = [
  {
    label: "Match plants with ANY of",
    value: "ANY",
    fn: (a: any, b: any) => a || b,
  },
  {
    label: "Match plants with ALL of",
    value: "ALL",
    fn: (a: any, b: any) => a && b,
  },
];

const plantTypeCombinatorOptions: PlantTypeCombinatorOptions = {
  default: combinators[0],
  array: combinators,
  byId: combinators.reduce(
    (dict: { [key: string]: PlantTypeCombinator }, c) => {
      dict[c.value] = c;
      return dict;
    },
    {}
  ),
};

export default plantTypeCombinatorOptions;
