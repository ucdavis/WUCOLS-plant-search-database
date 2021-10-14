import React from 'react';
import Select from 'react-select';
import PlantList from './PlantList';
import PlantTable from './PlantTable';
import {  faTh, faThLarge, faBars} from '@fortawesome/free-solid-svg-icons'
import sortPlants from './sort-plants';
import ultimatePagination from 'ultimate-pagination';
import { Pagination } from 'react-bootstrap';
import {
  //HashRouter as Router,
  useHistory,
  useLocation
} from "react-router-dom";

import Welcome from './welcome';

const performancePlantLimit = 50000;


const plantTypeCombinatorOptions = (() => {
    const options = [
        {
            label:'Match plants with ANY of',
            value: 'ANY',
            fn: (a,b) => a || b
        },
        {
            label:'Match plants with ALL of',
            value: 'ALL',
            fn: (a,b) => a && b
        }
    ];
    return {
        default: options[0],
        array: options,
        byId: options.reduce((dict,c) => { 
            dict[c.value] = c;
            return dict;
        }, {})
    };
})();

const SearchForm = ({
    cityOptions,
    searchCriteria,
    plantTypes,
    waterUseClassifications,
    updateSearchCriteria
}) => {
    //const {cityOptions,searchCriteria,updateSearchCriteria} = React.useContext(SearchCriteriaContext);
    const setPlantType = (code,checked) => 
        updateSearchCriteria({...searchCriteria, plantTypes: {...searchCriteria.plantTypes, [code]: checked}});
    const selectAllWaterUseClassifications = (selected) => {
        updateSearchCriteria({
        ...searchCriteria,
        waterUseClassifications: waterUseClassifications.reduce((dict, wu) => {
            dict[wu.code] = selected;
            return dict;
        },{})
        });
    };
    const onCityChange = (o) => {
        //console.log('onCityChange',o);
        updateSearchCriteria({...searchCriteria, city: o});
    }
    const onPlantTypeCombinatorChange = (ptc) => {
        updateSearchCriteria({...searchCriteria, plantTypeCombinator: ptc});
    };
    const selectAllPlantTypes = (selected) => {
        updateSearchCriteria({
        ...searchCriteria,
        plantTypes: plantTypes.reduce((dict, pt) => {
            dict[pt.code] = selected;
            return dict;
        },{})
        });
    };
    return (
        <div>
        <div className="form-group">
            <label><strong>City/Region</strong><br/>Start typing to search</label>
            <Select 
            styles={{
                container: base => ({
                ...base,
                flex: 1
                })
            }}
            options={cityOptions}
            placeholder="Select a city"
            value={searchCriteria.city}
            onChange={onCityChange}
            noOptionsMessage={() => "No cities found by that name"}/>
        </div>
        <div className="form-group">
            <label><strong>Plant Name</strong></label>
            <input 
            type="search"
            className="form-control"
            value={searchCriteria.name}
            placeholder="botanical or common name"
            onChange={e => updateSearchCriteria({...searchCriteria, name: e.target.value.toLowerCase()}) }
            />
        </div>
        <div className="form-group">
            <label className="form-label"><strong>Water Use</strong></label>
            <div>
            <button
                className="btn btn-sm btn-link"
                onClick={() => selectAllWaterUseClassifications(true)}>
                Select all
            </button>
            / <button
                className="btn btn-sm btn-link"
                onClick={() => selectAllWaterUseClassifications(false)}>
                Deselect all
            </button>
            </div>
            {waterUseClassifications.map(wu => (
            <div className="form-check" key={wu.code}>
                <input 
                className="form-check-input"
                type="checkbox"
                checked={searchCriteria.waterUseClassifications[wu.code]}
                onChange={e => updateSearchCriteria({...searchCriteria, waterUseClassifications: {...searchCriteria.waterUseClassifications, [wu.code]: e.target.checked}}) }
                id={wu.code + '_checkbox'}/>
                <label
                className="form-check-label"
                htmlFor={wu.code + '_checkbox'}>
                    {wu.name}
                </label>
            </div>
            ))}
        </div>
        <div className="form-group">
            <label className="form-label"><strong>Plant Types</strong></label> 
            <div>
            <button
                className="btn btn-sm btn-link"
                onClick={() => selectAllPlantTypes(true)}>
                Select all
            </button>
            /
            <button
                className="btn btn-sm btn-link"
                onClick={() => selectAllPlantTypes(false)}>
                Deselect all
            </button>
            </div>
            <div>
            <Select 
                styles={{
                container: base => ({
                    ...base,
                    flex: 1
                })
                }}
                options={plantTypeCombinatorOptions.array}
                value={searchCriteria.plantTypeCombinator}
                onChange={onPlantTypeCombinatorChange}
                noOptionsMessage={() => "No result"}/>
            </div>
            {plantTypes.map(pt => (
            <div className="form-check" key={pt.code}>
                <input 
                className="form-check-input"
                type="checkbox"
                checked={searchCriteria.plantTypes[pt.code]}
                onChange={e => setPlantType(pt.code,e.target.checked)}
                id={pt.code + '_checkbox'}/>
                <label
                className="form-check-label"
                htmlFor={pt.code + '_checkbox'}>
                    {pt.name}
                </label>
            </div>
            ))}
        </div>
        </div>
    );
};

const SearchCriteriaConverter = (() => {
  return {
    fromQuerystring: qs => {
      let ps = new URLSearchParams(qs);
      return {
        plantTypes: ps.getAll('pt').reduce((dict, pt) => {
          dict[pt] = true;  
          return dict;
        },{}),
        name: (ps.get('n') || "").toLowerCase(),
        plantTypeCombinatorId: ps.get('ptm'),
        cityId: parseInt(ps.get('c')),
        waterUseClassifications:ps.getAll('wu').reduce((dict, wu) => {
          dict[wu] = true;  
          return dict;
        },{})
      };
    },
    toQuerystring: sc => {
      let wu = Object.entries(sc.waterUseClassifications).filter(([,selected]) => selected).map(([code]) => code);
      let ps = new URLSearchParams(
        [
            ['c',sc.city.id],
            //exclude default param values for terser URLs
            ...(!sc.name ? [] : [['n',sc.name]]),
            ...(sc.plantTypeCombinator === plantTypeCombinatorOptions.default ? [] : [['ptm',sc.plantTypeCombinator.value]]),
            ...wu.map(wu => ['wu',wu])
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
    name: c.name,
    label: "Region " + c.region + ": " + c.name,
    value: c.name,
    region: c.region
  }));

  data.plantTypes = data.plantTypes.sort((a,b) => 
    a.name < b.name ? -1 : a.name > b.name ? 1 : 0);

  const getDefaultSearchCriteria = () => ({
    city: cityOptions[0],
    name: '',
    waterUseClassifications: {},
    plantTypes: data.plantTypes.reduce((dict, pt) => {
      dict[pt.code] = autoSearch ? pt.code === 'A' : false;
      return dict;
    },{}),
    plantTypeCombinator: plantTypeCombinatorOptions.default
  });

  const initSearchCriteria = () => {
    let up = SearchCriteriaConverter.fromQuerystring(location.search);
    console.log(up);
    let sc = getDefaultSearchCriteria();
    sc.waterUseClassifications = up.waterUseClassifications;
    sc.plantTypes = up.plantTypes;
    sc.name = up.name;
    sc.city = cityOptions.filter(o => o.id === up.cityId)[0] || sc.city;
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

  const updateSearchCriteria = React.useCallback(sc => {
      let qs = SearchCriteriaConverter.toQuerystring(sc);
    console.log('search altered',qs);
    if(!history){
      //console.log('no history')
      //return;
    }
    setSearchCriteria(sc);
    console.log(history)
    history.push({
        path: '/search',
        search: qs
    });
    //console.log(sc);
  },[history]);

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
      return sortPlants(searchCriteria.city.region)(data.plants.filter(p => {
        let typeOk = noType || typeFn(t => p.types.indexOf(t) > -1);
        let wu = p.waterUseByRegion[searchCriteria.city.region - 1];
        let wuOk = searchCriteria.waterUseClassifications[wu] || noWu;
        let nameOk = !searchCriteria.name || p.searchName.indexOf(searchCriteria.name) > -1;
        return wuOk && typeOk && nameOk;
      }))
      .slice(0,performancePlantLimit);
    },
    [data, searchCriteria, sortPlants]);

  const [currentPageNumber,setCurrentPageNumber] = React.useState(1);

  React.useEffect(() => {
    //Optimally, paging resets when a user changes their search.  This offers the best user experience.
    setCurrentPageNumber(1);
  }, [searchCriteria]);

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
    pageCount > 1 && <Pagination>
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
          default                  : return <></>
        }
      })}
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
            <plantsViewMode.component 
              isPlantFavorite={isPlantFavorite}
              togglePlantFavorite={togglePlantFavorite}
              plants={matchingPlants.slice((currentPageNumber-1)*pageSize, (currentPageNumber+1)*pageSize)} 
              photosByPlantName={data.photos}
              plantTypeNameByCode={data.plantTypeNameByCode} 
              region={searchCriteria.city.region}
              waterUseByCode={data.waterUseByCode}/>
            {actualPagination}
          </>
        }
      </main>
    </div>
  </div>
};

export default Search;