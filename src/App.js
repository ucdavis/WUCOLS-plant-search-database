import React from 'react';
import ReactDOM from 'react-dom';
import './App.css';
import Map from './Map';
import './map.css'
//import {useGeolocation} from '../src/useGeolocation';
import useLocalStorage from './useLocalStorage';
import PlantList from './PlantList';
import PlantTable from './PlantTable';
import PlantDetail from './PlantDetail';
import {SearchForm,plantTypeCombinators} from './SearchForm';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { /*faSearchLocation, faIdCardAlt, faCaretDown, faCartArrowDown, faMap,*/ faMapMarkerAlt,faFileExcel, faTh, faThLarge, faBars, faSearch, faStar, faLeaf, faQrcode, faIdCard, faDownload} from '@fortawesome/free-solid-svg-icons'
import ultimatePagination from 'ultimate-pagination';

import { DropdownButton,Dropdown,Pagination } from 'react-bootstrap';

import ReactExport from 'react-export-excel';
import {
  //BrowserRouter as Router,
  HashRouter as Router,
  Route,
  NavLink,
  Redirect,
  //Switch,
  //useLocation
} from "react-router-dom";
//import groupBy from './groupBy';
import SimpleReactLightbox from 'simple-react-lightbox'
import { useToasts } from 'react-toast-notifications'

const performancePlantLimit = 50000;

const getWaterUseSortValue = (() => {
  const sortValueByWaterUseCode = { 'VL': 1, 'LO': 2, 'M': 3, 'H': 4, '?': 5, '/': 6 };
  return code => {
    return sortValueByWaterUseCode[code] || 99;
  };
})();

function App({data}) {
  //const {lat,lng,error} = useGeolocation(false,{enableHighAccuracy: true});

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

  /*
  cityOptions = groupBy(cityOptions, c => "Region " + c.region)
  .map(g => ({label: g.key, options: g.values}));
  */
  cityOptions = cityOptions.sort((a,b) => a.label > b.label ? 1 : a.label < b.label ? -1 : 0);
   
  const autoSearch = false;
  const getDefaultSearchCriteria = () => ({
    city: cityOptions[0],
    name: '',
    waterUseClassifications: data.waterUseClassifications.reduce((dict,wu) => {
      dict[wu.code] = autoSearch ? wu.code === 'VL' : false;
      return dict;
    },{}),
    plantTypes: data.plantTypes.reduce((dict, pt) => {
      dict[pt.code] = autoSearch ? pt.code === 'A' : false;
      return dict;
    },{}),
    plantTypeCombinator: plantTypeCombinators.byId['ANY']
  });

  const [searchCriteria, updateSearchCriteria] = React.useState(getDefaultSearchCriteria());

  const resetSearchCriteria = () => updateSearchCriteria(getDefaultSearchCriteria());

  const sortPlants = React.useCallback(plants => {
    return plants.sort((plantA,plantB) => {
      let a = getWaterUseSortValue(plantA.waterUseByRegion[searchCriteria.city.region - 1]);
      let b = getWaterUseSortValue(plantB.waterUseByRegion[searchCriteria.city.region - 1]);
      return a < b ? -1 : a > b ? 1 : 0;
    })
  },[searchCriteria.city.region]);

  const searchPerformed = 
    Object.values(searchCriteria.waterUseClassifications).some(b => b)
    || Object.values(searchCriteria.plantTypes).some(b => b)
    || searchCriteria.name.length > 0;

  const [isFavoriteByPlantId, updateIsFavoriteByPlantId] = useLocalStorage('isFavoriteByPlantId', {});
  const favoritePlants = sortPlants(data.plants.filter(p => !!isFavoriteByPlantId[p.id]));

  const { addToast, removeToast } = useToasts()
  function togglePlantFavorite(p) {
    let isFavoriteNow = !isFavoriteByPlantId[p.id];
    updateIsFavoriteByPlantId({...isFavoriteByPlantId, [p.id]: isFavoriteNow});
    let thisToastId = undefined;
    addToast((
      <div>
        Plant {isFavoriteNow ? 'added to' : 'removed from'} favorites
        <button className="btn btn-link" onClick={() => {
          updateIsFavoriteByPlantId({...isFavoriteByPlantId, [p.id]: !isFavoriteNow});
          removeToast(thisToastId);
          //togglePlantFavorite(p);
        }}>
          UNDO
        </button>
      </div>), {
      appearance: 'info',
      transitionState: 'entered',
      autoDismiss: true
    }, toastId => {
      thisToastId = toastId;
    });
  }

  const isPlantFavorite = p => !!isFavoriteByPlantId[p.id];

  const matchingPlants = React.useMemo(
    () => {
      let noType = Object.values(searchCriteria.plantTypes).every(b => !b);
      let noWu = Object.values(searchCriteria.waterUseClassifications).every(b => !b);
      let types = Object.entries(searchCriteria.plantTypes).filter(([k,v]) => !!v).map(([k,v]) => k);
      let typeFn = searchCriteria.plantTypeCombinator === plantTypeCombinators.byId['ANY']
          ? types.some.bind(types)
          : types.every.bind(types);
      console.log(types);
      return sortPlants(data.plants.filter(p => {
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
console.log('pagination',paginationModel);

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

const favoriteAsSpreadsheets = (data,searchCriteria,favoritePlants) => {
  const csv = 
    [
      ["Type(s)", "Botanical Name", "Common Name","Water Use", "Percentage of ET0"],
      ...favoritePlants
      .map(p => [
        p.types.map(t => data.plantTypeNameByCode[t]).join(', ')
        ,p.botanicalName
        ,p.commonName
        ,data.waterUseByCode[p.waterUseByRegion[searchCriteria.city.region-1]].name
        ,data.waterUseByCode[p.waterUseByRegion[searchCriteria.city.region-1]].percentageET0 + '%'
      ])
    ];

  const xl = 
    [
      {
        columns: ["Type(s)", "Botanical Name", "Common Name","Water Use", "Percentage of ET0"].map(c => ({
          value: c
        })).map(c => c.value)
        ,data: favoritePlants.map(p => [
          p.types.map(t => data.plantTypeNameByCode[t]).join(', ')
          ,p.botanicalName
          ,p.commonName
          ,data.waterUseByCode[p.waterUseByRegion[searchCriteria.city.region-1]].name
          ,data.waterUseByCode[p.waterUseByRegion[searchCriteria.city.region-1]].percentageET0 + '%'
        ])
      }
    ];

  return [csv, xl];
}

const downloadActions = (data,searchCriteria,favoritePlants) => {
  const ExcelFile = ReactExport.ExcelFile;
  const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
  let [,excelData] = favoriteAsSpreadsheets(data,searchCriteria,favoritePlants);
  const sideRender = el => {
    ReactDOM.render(el, document.getElementById('download-outlet'));
  };
  return [
  /*
    {
      method: () => {
        sideRender(
          <CSVDownload
            target="_blank"
            data={csvData}
            filename={`WUCOLS_${searchCriteria.city.name}.csv`}
          />
        );
      },
      label: 
        <>
          <FontAwesomeIcon icon={faFileExcel} className="mr-2"/>
          Download in CSV format
        </>
    }
    ,
    */
    {
      method: () => {
        sideRender(
          <ExcelFile filename={`WUCOLS_${searchCriteria.city.name}`} hideElement={true}>
            <ExcelSheet dataSet={excelData} name={`WUCOLS_${searchCriteria.city.name}`}/>
          </ExcelFile>
        );
      },
      label: 
        <>
          <FontAwesomeIcon icon={faFileExcel} className="mr-2"/>
          Download in Excel format
        </>
    },
    {
      method: () => {
        alert('Not implemented yet');
      },
      label: 
        <>
          <FontAwesomeIcon icon={faQrcode} className="mr-2"/>
          Download QR codes
        </>
    },
    {
      method: () => {
        alert('Not implemented yet');
      },
      label: 
        <>
          <FontAwesomeIcon icon={faIdCard} className="mr-2"/>
          Download Bench Cards
        </>
    }
  ];
};

const downloadButtons = (className,searchCriteria,favoritePlants) => {
  return downloadActions(data,searchCriteria,favoritePlants).map(a =>
    <button className={className} onClick={a.method}>
      {a.label}
    </button>
  );
}

  return (
    <Router>
      <div className="App">
        <nav className="navbar navbar-dark bg-dark sticky-top navbar-light bg-light d-flex justify-content-between">
          <a className="navbar-brand" href="/">
            WUCOLS Plant Search Database
          </a>

          <div className="btn-group">
            {[
              {
                label: 'Search',
                icon: faSearch,
                to: '/search'
              },
              {
                label: `Favorites (${favoritePlants.length})`,
                icon: faStar,
                to: '/favorites',
                tooltip: 'Download options available'
              }

            ].map(vm => 
              <NavLink activeClassName="active" className="btn btn-outline-light" to={vm.to}>
                <FontAwesomeIcon icon={vm.icon} />
                <span className="ml-2" title={vm.tooltip}>
                  {vm.label}
                </span>
              </NavLink>
    
    )}
          </div>

          <DropdownButton title="Download" variant="outline-light">
            {downloadActions(data,searchCriteria,favoritePlants).map(a => 
              <Dropdown.Item onClick={a.method}>
                {a.label}
              </Dropdown.Item>
            )}
          </DropdownButton>

          {/*
          <div>
            <span className="mr-3 text-light">
              View plants in a
            </span>
            <div className="btn-group">
              {plantsViewModes.map(vm => 
                <button className={'btn btn-outline-light' + (vm.id === plantsViewModeId ? ' active' : '')} onClick={() => {
                  setPlantsViewModeId(vm.id);
                }}>
                  <FontAwesomeIcon icon={vm.icon} />
                  <span className="ml-2">
                    {vm.label}
                  </span>
                </button>
              )}
            </div>
          </div>
          */}
        </nav>
        <Route exact={true} path="/">
          <Redirect to="/search" />
        </Route>
        <Route path="/map" render={({match}) => {
          return (
            <div>
              <Map cities={data.cities} onSelect={city => {alert(city.name)}} />
            </div>);
        }}/>
        <Route path="/plant/:plantId" render={({match}) => {
          let plant = data.plants.filter(p => p.id === match.params.plantId || p.url_keyword === match.params.plantId)[0];
          return !plant 
            ? <div>No plant found by that ID</div>
            : <div className="container-fluid">
                <SimpleReactLightbox>
                  <PlantDetail {...{
                    plant,
                    photos: data.photos[plant.botanicalName] || [],
                    plantTypeNameByCode: data.plantTypeNameByCode,
                    waterUseByCode: data.waterUseByCode,
                    waterUseClassifications: data.waterUseClassifications,
                    region: searchCriteria.city.region,
                    togglePlantFavorite,
                    isPlantFavorite,
                    regions: data.regions
                  }} />
                </SimpleReactLightbox>
              </div>;
        }}/>
        <Route exact={true} path="/favorites">
          <div className="container-fluid">
            {!favoritePlants.length 
            ? <div className="py-5">
                <div className="text-center mb-5">
                  <div className="h3">You do not have any favorite species yet</div>
                  <p>
                    After you have added some favorites, you can download them in various formats.
                  </p>
                </div>
                <div className="d-flex justify-content-around">
                  {[
                    {
                      icon: faFileExcel,
                      label: 'Spreadsheet'
                    },
                    {
                      icon: faQrcode,
                      label:'QR Codes'
                    },
                    {
                      icon: faIdCard,
                      label:'Bench Cards'
                    }
                  ].map(f => 
                    <div className="">
                    <div className="card">
                      <div className="card-body text-center">
                        <FontAwesomeIcon icon={f.icon} className="mt-2 h1"/>
                        <div className="h5">
                          {f.label}
                        </div>
                      </div>
                    </div>
                    </div>
                  )}
                </div>
              </div>
            : 
            <div className="row">
              <nav className="col-sm-4 col-lg-3 col-xl-2 sidebar bg-light">
                <div className="sidebar-sticky p-3"  >
                  {
                    !!favoritePlants.length
                    && (
                      <div className="mb-3 d-flex flex-column justify-content-around">
                        {downloadButtons("btn btn-success btn-block",searchCriteria,favoritePlants).map(c => <div className="my-2">{c}</div>)}
                      </div>
                    )
                  }
                </div>
              </nav>
              <div className="col-sm-8 col-lg-9 col-xl-10 ml-sm-auto">
                  <div className="my-3">
                    {
                      favoritePlants.length === 0 
                      ? "You don't have any favorites yet."
                      : favoritePlants.length === 1
                      ? "You have 1 favorite so far."
                      : (<div>You have <strong>{favoritePlants.length}</strong> favorites so far.</div>)
                    }
                  </div>
                <plantsViewMode.component 
                  isPlantFavorite={isPlantFavorite}
                  togglePlantFavorite={togglePlantFavorite}
                  plants={favoritePlants} 
                  photosByPlantName={data.photos}
                  plantTypeNameByCode={data.plantTypeNameByCode} 
                  region={searchCriteria.city.region}
                  waterUseByCode={data.waterUseByCode}/>
              </div>
            </div>}
          </div>
        </Route>
        {/*
        <Route exact="true" path="/search/(types)?/:types?" render={match => 
        */}
        <Route exact="true" path="/search" render={match => 
          <>
          <div className="container-fluid">
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
                ? 
                  <div className="text-center my-5">
                    <FontAwesomeIcon icon={faLeaf} className="display-4 text-success my-3"/>
                    <div className="display-4">Welcome to WUCOLS</div>
                    <div className="my-4">
                      <p className="lead">
                        <strong>WUCOLS = </strong>
                        {[
                          "Water",
                          "Use",
                          "Classification",
                          "Of",
                          "Landscape",
                          "Species"
                        ].map(w => <span><strong className="text-lg">{w[0]}</strong>{w.slice(1)} </span>)}
                      </p>
                      <p className="lead">
                        WUCOLS helps you create a landscape plan based on plant water use within your city/region. 
                      </p>
                    </div>

                    <div className="card-group">
                      {[
                        {
                          icon: faMapMarkerAlt,
                          label: 'Select a City/Region',
                          description: 'This will determine the appropriate water use rating for each plant.'
                        },
                        {
                          icon: faSearch,
                          label:'Search',
                          description:  <>
                            Enter any combination of 
                              {["Plant Name", "Water Use", "Plant Types"].map(txt => <div><strong>{txt}</strong></div>)}
                            to find plants of interest.
                          </>
                        },
                        {
                          icon: faStar,
                          label:'Favorite',
                          description: 'Assemble a list of your plants that meet your needs.'
                        },
                        {
                          icon: faDownload,
                          label:'Download',
                          description: 'Download your list in a variety of formats'
                        }
                      ].map((f,i) => 
                        <div className="card">
                          <div className="card-body">
                            <FontAwesomeIcon icon={f.icon} className="mt-2 h1"/>
                            <div className="h4">
                              {i+1+'. '} 
                              {f.label}
                            </div>
                            <div className="card-text mt-5">
                              {f.description}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

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
        </>
        }/>
      </div>
    </Router>
  );
}

export default App;