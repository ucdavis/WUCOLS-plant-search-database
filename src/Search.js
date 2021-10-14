import React from 'react';
import PlantList from './PlantList';
import PlantTable from './PlantTable';
import {  faTh, faThLarge, faBars} from '@fortawesome/free-solid-svg-icons'
import sortPlants from './sort-plants';
import ultimatePagination from 'ultimate-pagination';
import { Pagination } from 'react-bootstrap';
import plantTypeCombinatorOptions from './plant-type-combinator-options';
import SearchForm from './search-form';
import {
  //HashRouter as Router,
  useHistory,
  useLocation
} from "react-router-dom";

import Welcome from './welcome';

const performancePlantLimit = 50000;


const SearchCriteriaConverter = (() => {
  return {
    fromQuerystring: qs => {
      let ps = new URLSearchParams(qs);
      return {
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
            ...(sc.p === 1 ? [] : [['p', sc.p]]),
        ]);
      return ps.toString();
    }
  };
})();

const Search = ({data, setSearchCriteria,isPlantFavorite,togglePlantFavorite }) => {
  const history = useHistory();
  const location = useLocation();

  let plantsViewModes = [
    {
      id: 'list',
      label: 'List',
      component: PlantTable,
      icon: faBars
    },
    {
      id:'grid',
      label: 'Grid',
      component: (props) => PlantList({...props, className: 'col-sm-12 col-lg-6 col-xl-6'}),
      icon: faThLarge
    },
    {
      id:'dense-grid',
      label: 'Dense Grid',
      component: (props) => PlantList({...props, className: 'col-sm-12 col-lg-6 col-xl-4'}),
      icon: faTh
    }
  ];
  const [plantsViewModeId] = React.useState(plantsViewModes[0].id);
  const plantsViewMode = plantsViewModes.filter(vm => vm.id === plantsViewModeId)[0] || plantsViewModes[0];
  
  let cityOptions = data.cities.map(c => ({
    id: c.id,
    position: c.position,
    key: c.id,
    name: c.name,
    label: "Region " + c.region + ": " + c.name,
    value: c.name,
    region: c.region
  }));

  data.plantTypes = data.plantTypes.sort((a,b) => 
    a.name < b.name ? -1 : a.name > b.name ? 1 : 0);

  const getDefaultSearchCriteria = () => ({
    city: null,
    name: '',
    waterUseClassifications: {},
    plantTypes: data.plantTypes.reduce((dict, pt) => {
      dict[pt.code] = autoSearch ? pt.code === 'A' : false;
      return dict;
    },{}),
    p: 1,
    plantTypeCombinator: plantTypeCombinatorOptions.default
  });

  const initSearchCriteria = () => {
    let up = SearchCriteriaConverter.fromQuerystring(location.search);
    //console.log(up);
    let sc = getDefaultSearchCriteria();
    sc.waterUseClassifications = up.waterUseClassifications;
    sc.plantTypes = up.plantTypes;
    sc.name = up.name;
    sc.city = cityOptions.filter(o => o.id === up.cityId)[0] || sc.city;
    sc.p = 1;
    if(up.plantTypeCombinatorId in plantTypeCombinatorOptions.byId){
        sc.plantTypeCombinator = plantTypeCombinatorOptions.byId[up.plantTypeCombinatorId];
    }
    return sc;
  };

  /*
  cityOptions = groupBy(cityOptions, c => "Region " + c.region)
  .map(g => ({label: g.key, options: g.values}));
  */
  cityOptions = cityOptions.sort((a,b) => a.label > b.label ? 1 : a.label < b.label ? -1 : 0);
   
  const autoSearch = false;

  const searchCriteria = initSearchCriteria();
  const [currentPageNumber,setCurrentPageNumber] = React.useState(1);

  const updateSearchCriteria = React.useCallback(sc => {
      let qs = SearchCriteriaConverter.toQuerystring(sc);
    //console.log('search altered',qs);
    if(!history){
      //console.log('no history')
      //return;
    }
    setSearchCriteria(sc);
    //console.log(history)
    history.push({
        path: '/search',
        search: qs
    });
    //console.log(sc);
  },[setSearchCriteria,history]);

  const resetSearchCriteria = () => updateSearchCriteria(getDefaultSearchCriteria());

  const searchPerformed = 
    Object.values(searchCriteria.waterUseClassifications).some(b => b)
    || Object.values(searchCriteria.plantTypes).some(b => b)
    || searchCriteria.name.length > 0;

  const matchingPlants = React.useMemo(
    () => {
      let noType = Object.values(searchCriteria.plantTypes).every(b => !b);
      let noWu = Object.values(searchCriteria.waterUseClassifications).every(b => !b);
      let types = Object.entries(searchCriteria.plantTypes).filter(([k,v]) => !!v).map(([k,v]) => k);
      let typeFn = searchCriteria.plantTypeCombinator === plantTypeCombinatorOptions.byId['ANY']
          ? types.some.bind(types)
          : types.every.bind(types);
      //console.log(types);
      if(!searchCriteria.city){
        return [];
      }
      return sortPlants(searchCriteria.city.region)(data.plants.filter(p => {
        let typeOk = noType || typeFn(t => p.types.indexOf(t) > -1);
        let wu = p.waterUseByRegion[searchCriteria.city.region - 1];
        let wuOk = searchCriteria.waterUseClassifications[wu] || noWu;
        let nameOk = !searchCriteria.name || p.searchName.indexOf(searchCriteria.name) > -1;
        return wuOk && typeOk && nameOk;
      }))
      .slice(0,performancePlantLimit);
    },
    [data, searchCriteria]);

  const pageSize = 50;
  const pageCount = Math.max(1,Math.ceil(matchingPlants.length/pageSize));
  var paginationModel = ultimatePagination.getPaginationModel({
    // Required
    currentPage: pageCount > 0 ? currentPageNumber : 1,
    totalPages: pageCount,
  
    // Optional
    boundaryPagesRange: 1,
    siblingPagesRange: 1,
    hideEllipsis: false,
    hidePreviousAndNextPageLinks: false,
    hideFirstAndLastPageLinks: false
  });
  //console.log('pagination',paginationModel);

  const actualPagination = 
    pageCount > 1 && 
        <Pagination>
            {paginationModel.map(p => {
                const props = {
                    key: p.key,
                    active: p.isActive,
                    onClick: () => setCurrentPageNumber(p.value)
                };
                switch(p.type){
                    //case 'PREVIOUS_PAGE_LINK': return <Pagination.Prev {...props}/>
                    //case 'NEXT_PAGE_LINK'    : return <Pagination.Next {...props}/>
                    case 'PAGE'              : return <Pagination.Item {...props}>{p.value}</Pagination.Item>
                    case 'ELLIPSIS'          : return <Pagination.Ellipsis {...props}/>
                    default                  : return undefined;
                }
            })
            .filter(f => !!f)}
        </Pagination>;

  return <div className="container-fluid">
    {/*
    <div>
      <pre>{JSON.stringify(match,null,2)}</pre>
    </div>
    */}
    <div className="row">
      <nav className="col-sm-4 col-lg-3 col-xl-2 sidebar bg-light">
        <div className="sidebar-sticky p-3"  >

          <SearchForm
            waterUseClassifications={data.waterUseClassifications}
            plantTypes={data.plantTypes}
            cityOptions={cityOptions}
            searchCriteria={searchCriteria}
            updateSearchCriteria={updateSearchCriteria}/>
        </div>
      </nav>

      <main className="col-sm-8 col-lg-9 col-xl-10 ml-sm-auto" role="main">
        {!searchPerformed 
        ? <Welcome />
        : <>

            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                Matching Plants: {matchingPlants.length}
              </div>

              {searchPerformed && 
                <button className="btn btn-link" onClick={() => resetSearchCriteria()}>
                  Clear Search Form
                  (Start over)
                </button>}
            {
            /*
              <pre>{JSON.stringify({paginationModel,currentPageNumber,pageCount}, null, 2)}</pre>
            */
            }
            </div>
            {actualPagination}
            {!searchCriteria.city
                ? <div>Please select a city</div>
                : <plantsViewMode.component 
                    isPlantFavorite={isPlantFavorite}
                    togglePlantFavorite={togglePlantFavorite}
                    plants={matchingPlants.slice((currentPageNumber-1)*pageSize, (currentPageNumber+1)*pageSize)} 
                    photosByPlantName={data.photos}
                    plantTypeNameByCode={data.plantTypeNameByCode} 
                    region={searchCriteria.city.region}
                    waterUseByCode={data.waterUseByCode}/>
            }
            {actualPagination}
          </>
        }
      </main>
    </div>
  </div>
};

export default Search;