const plantTypeCombinatorOptions = (() => {
  const options = [
    {
      label: "Match plants with ANY of",
      value: "ANY",
      fn: (a, b) => a || b,
    },
    {
      label: "Match plants with ALL of",
      value: "ALL",
      fn: (a, b) => a && b,
    },
  ];
  return {
    default: options[0],
    array: options,
    byId: options.reduce((dict, c) => {
      dict[c.value] = c;
      return dict;
    }, {}),
  };
})();

export default plantTypeCombinatorOptions;
