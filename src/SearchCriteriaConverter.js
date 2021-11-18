import plantTypeCombinatorOptions from './plant-type-combinator-options';

const SearchCriteriaConverter = (() => {
  return {
    fromQuerystring: qs => {
      let ps = new URLSearchParams(qs);
      return {
        pageNumber: parseInt(ps.get('p') || "") || 1, 
        plantTypes: ps.getAll('t').reduce((dict, pt) => {
          dict[pt] = true;  
          return dict;
        },{}),
        name: (ps.get('n') || "").toLowerCase(),
        plantTypeCombinatorId: ps.get('tm'),
        cityId: parseInt(ps.get('c')),
        waterUseClassifications:ps.getAll('wu').reduce((dict, wu) => {
          dict[wu] = true;  
          return dict;
        },{})
      };
    },
    toQuerystring: sc => {
      let wu = Object.entries(sc.waterUseClassifications).filter(([,selected]) => selected).map(([code]) => code);
      let pt = Object.entries(sc.plantTypes).filter(([,selected]) => selected).map(([code]) => code);
      let ps = new URLSearchParams(
        [
            ...(!sc.city ? [] : [ ['c',sc.city.id] ]),
            //exclude default param values for terser URLs
            ...(!sc.name ? [] : [['n',sc.name]]),
            ...(sc.plantTypeCombinator === plantTypeCombinatorOptions.default ? [] : [['tm',sc.plantTypeCombinator.value]]),
            ...wu.map(wu => ['wu',wu]),
            ...pt.map(pt => ['t',pt]),
            ...(sc.pageNumber === 1 ? [] : [['p', sc.pageNumber]]),
        ]);
      return ps.toString();
    }
  };
})();

const autoSearch = false;

const getDefaultSearchCriteria = (plantTypes) => ({
	city: null,
	name: '',
	waterUseClassifications: {},
	plantTypes: plantTypes.reduce((dict, pt) => {
		dict[pt.code] = autoSearch ? pt.code === 'A' : false;
		return dict;
	},{}),
	pageNumber: 1,
	plantTypeCombinator: plantTypeCombinatorOptions.default
});

SearchCriteriaConverter.getDefaultSearchCriteria = getDefaultSearchCriteria;

SearchCriteriaConverter.initSearchCriteria = (querystring,cityOptions,plantTypes) => {
	let up = SearchCriteriaConverter.fromQuerystring(querystring);
	//console.log(up);
	let sc = getDefaultSearchCriteria(plantTypes);
	sc.waterUseClassifications = up.waterUseClassifications;
	sc.plantTypes = up.plantTypes;
	sc.name = up.name;
	sc.pageNumber = up.pageNumber;
	sc.city = cityOptions.filter(o => o.id === up.cityId)[0] || sc.city;
	if(up.plantTypeCombinatorId in plantTypeCombinatorOptions.byId){
			sc.plantTypeCombinator = plantTypeCombinatorOptions.byId[up.plantTypeCombinatorId];
	}
	return sc;
};

export default SearchCriteriaConverter;