import React from 'react';
import './App.css';
//import {useGeolocation} from '../src/useGeolocation';
import useLocalStorage from './useLocalStorage';
import { CSVLink } from "react-csv";
import PlantList from './PlantList';
import PlantTable from './PlantTable';
import PlantDetail from './PlantDetail';
import SearchForm from './SearchForm';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFileExcel, faTh, faThLarge, faBars, faSearch, faStar, faLeaf, faQrcode, faIdCard, faIdCardAlt} from '@fortawesome/free-solid-svg-icons'
import {
  BrowserRouter,
  HashRouter as Router,
  Route,
  NavLink,
  Redirect,
  Switch,
  useLocation
} from "react-router-dom";
//import groupBy from './groupBy';
import SimpleReactLightbox from 'simple-react-lightbox'
import { useToasts } from 'react-toast-notifications'

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
  const [plantsViewModeId, setPlantsViewModeId] = React.useState(plantsViewModes[0].id);
  const plantsViewMode = plantsViewModes.filter(vm => vm.id === plantsViewModeId)[0] || plantsViewModes[0];
  
  let cityOptions = data.cities.map(c => ({
    id: c.id,
    name: c.name,
    label: "Region " + c.region + ": " + c.name,
    value: c.name,
    region: c.region
  }));
  
  const sortPlants = plants => {
    return plants.sort((plantA,plantB) => {
      let a = getWaterUseSortValue(plantA.waterUseByRegion[searchCriteria.city.region - 1]);
      let b = getWaterUseSortValue(plantB.waterUseByRegion[searchCriteria.city.region - 1]);
      return a < b ? -1 : a > b ? 1 : 0;
    })
  }

  data.plantTypes = data.plantTypes.sort((a,b) => 
    a.name < b.name ? -1 : a.name > b.name ? 1 : 0);

  /*
  cityOptions = groupBy(cityOptions, c => "Region " + c.region)
  .map(g => ({label: g.key, options: g.values}));
  */
  cityOptions = cityOptions.sort((a,b) => a.label > b.label ? 1 : a.label < b.label ? -1 : 0);
   
  const autoSearch = false;

  const [searchCriteria, updateSearchCriteria] = React.useState({
    city: cityOptions[0],
    name: '',
    waterUseClassifications: data.waterUseClassifications.reduce((dict,wu) => {
      dict[wu.code] = autoSearch ? wu.code === 'VL' : false;
      return dict;
    },{}),
    plantTypes: data.plantTypes.reduce((dict, pt) => {
      dict[pt.code] = autoSearch ? pt.code === 'A' : false;
      return dict;
    },{})
  });
  const searchPerformed = 
    Object.values(searchCriteria.waterUseClassifications).some(b => b)
    || Object.values(searchCriteria.plantTypes).some(b => b);

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

  //console.log(searchCriteria);
  const plantTypeNameByCode = 
    data.plantTypes.reduce((dict,t) => { 
      dict[t.code] = t.name;
      return dict;
    },{});

  const waterUseByCode = 
    data.waterUseClassifications.reduce((dict,wu) => { 
      dict[wu.code] = wu;
      return dict;
    },{});

  const matchingPlants = React.useMemo(
    () => sortPlants(data.plants.filter(p => {
      let typeOk = p.types.some(t => searchCriteria.plantTypes[t]);
      let wu = p.waterUseByRegion[searchCriteria.city.region - 1];
      let wuOk = searchCriteria.waterUseClassifications[wu];
      let nameOk = !searchCriteria.name || p.searchName.indexOf(searchCriteria.name) > -1;
      return wuOk && typeOk && nameOk;
    }))
    .slice(0,10),
    [data, searchCriteria]);

  const favoritesCsvData = 
    [
      ["ID", "Type(s)", "Botanical Name", "Common Name","Water Use", "Percentage of ET0"],
      ...favoritePlants
      .map(p => [
        p.id
        ,p.types.map(t => plantTypeNameByCode[t]).join(', ')
        ,p.botanicalName
        ,p.commonName
        ,waterUseByCode[p.waterUseByRegion[searchCriteria.city.region-1]].name
        ,waterUseByCode[p.waterUseByRegion[searchCriteria.city.region-1]].percentageET0 + '%'
      ])
    ];

  return (
    <Router>
      <div className="App">
        <nav className="navbar navbar-dark bg-dark sticky-top navbar-light bg-light d-flex justify-content-between">
          <a className="navbar-brand" href="https://ucanr.edu/sites/wucols">WUCOLS Plant Search Database</a>

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
                to: '/favorites'
              }

            ].map(vm => 
              <NavLink activeClassName="active" className="btn btn-outline-light" to={vm.to}>
                <FontAwesomeIcon icon={vm.icon} />
                <span className="ml-2">
                  {vm.label}
                </span>
              </NavLink>
            )}
          </div>

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
        </nav>
        <Route exact={true} path="/">
          <Redirect to="/search" />
        </Route>
        <Route path="/plant/:plantId" render={({match}) => {
          let plant = data.plants.filter(p => p.id == match.params.plantId || p.url_keyword == match.params.plantId)[0];
          return !plant 
            ? <div>No plant found by that ID</div>
            : <div className="container-fluid">
                <SimpleReactLightbox>
                  <PlantDetail {...{
                    plant,
                    photos: data.photos[plant.botanicalName] || [],
                    plantTypeNameByCode,
                    waterUseByCode,
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
                        {[
                          <CSVLink
                            className="btn btn-success btn-block"
                            data={favoritesCsvData}
                            filename={`WUCOLS_${searchCriteria.city.name}.csv`}>
                              <FontAwesomeIcon icon={faFileExcel} className="mr-2"/>
                              Download as a spreadsheet
                          </CSVLink>,
                          <button className="btn btn-success btn-block" onClick={() => alert('Not yet available')}>
                            <FontAwesomeIcon icon={faQrcode} className="mr-2"/>
                            Download QR codes
                          </button>,
                          <button className="btn btn-success btn-block" onClick={() => alert('Not yet available')}>
                            <FontAwesomeIcon icon={faIdCard} className="mr-2"/>
                            Download Bench Cards
                          </button>
                        ].map(c => <div className="my-2">{c}</div>)}
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
                  plantTypeNameByCode={plantTypeNameByCode} 
                  region={searchCriteria.city.region}
                  waterUseByCode={waterUseByCode}/>
              </div>
            </div>}
          </div>
        </Route>
        <Route exact={true} path="/search">
          <div className="container-fluid">
            <div className="row">
              <nav className="col-sm-4 col-lg-3 col-xl-2 sidebar bg-light">
                <div className="sidebar-sticky p-3"  >
                  <p>{data.plants.length} species and counting</p>

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
                    <div className="display-4">Welcome</div>
                    <p className="lead my-4">
                      To begin, select a city and perform a search.
                    </p>
                    <FontAwesomeIcon icon={faLeaf} className="display-4 text-success mr-3"/>
                    <FontAwesomeIcon icon={faSearch} className="display-4"/>
                    <br/>
                  </div>

                : <>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div>
                        Matching Plants: {matchingPlants.length}
                      </div>
                    </div>
                    <plantsViewMode.component 
                      isPlantFavorite={isPlantFavorite}
                      togglePlantFavorite={togglePlantFavorite}
                      plants={matchingPlants} 
                      photosByPlantName={data.photos}
                      plantTypeNameByCode={plantTypeNameByCode} 
                      region={searchCriteria.city.region}
                      waterUseByCode={waterUseByCode}/>
                  </>
                }
              </main>
            </div>
          </div>
        </Route>
      </div>
    </Router>
  );
}

export default App;