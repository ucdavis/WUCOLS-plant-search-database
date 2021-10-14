import React from 'react';
import ReactDOM from 'react-dom';
import './App.css';
import Map from './Map';
import PlantTable from './PlantTable';
import './map.css'
//import {useGeolocation} from '../src/useGeolocation';
import useLocalStorage from './useLocalStorage';
import sortPlants from './sort-plants';
import Search from './Search';
import PlantDetail from './PlantDetail';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {  faQrcode, faSearch, faFileExcel, faStar, faIdCard} from '@fortawesome/free-solid-svg-icons'

import { DropdownButton,Dropdown,Pagination } from 'react-bootstrap';

import ReactExport from 'react-export-excel';
import {
  BrowserRouter as Router,
  //HashRouter as Router,
  Route,
  NavLink,
  Redirect,
} from "react-router-dom";
//import groupBy from './groupBy';
import SimpleReactLightbox from 'simple-react-lightbox'
import { useToasts } from 'react-toast-notifications'



function App({data}) {
  //const {lat,lng,error} = useGeolocation(false,{enableHighAccuracy: true});
  const [searchCriteria, setSearchCriteria] = React.useState({city:{region:1}});

  const [isFavoriteByPlantId, updateIsFavoriteByPlantId] = useLocalStorage('isFavoriteByPlantId', {});
  const favoritePlants = sortPlants(searchCriteria.city.region)(data.plants.filter(p => !!isFavoriteByPlantId[p.id]));

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
    <Router basename={process.env.PUBLIC_URL}>
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
          const id = parseInt(match.params.plantId);
          let plant = data.plants.filter(p => p.id === id || p.url_keyword === match.params.plantId)[0];
          return !plant 
            ? <div className="container-fluid my-5">No plant found by that ID</div>
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
                <PlantTable 
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
          <Search
            isPlantFavorite={isPlantFavorite}
            togglePlantFavorite={togglePlantFavorite}
            setSearchCriteria={setSearchCriteria}
            data={data}
          />
        }/>
      </div>
    </Router>
  );
}

export default App;