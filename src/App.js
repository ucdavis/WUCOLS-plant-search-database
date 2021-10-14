import React from 'react';
import ReactDOM from 'react-dom';
import './App.css';
import Map from './Map';
//import {useGeolocation} from '../src/useGeolocation';
import useLocalStorage from './useLocalStorage';
import sortPlants from './sort-plants';
import Search from './Search';
import PlantDetail from './PlantDetail';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {  faQrcode, faSearch, faFileExcel, faStar, faIdCard} from '@fortawesome/free-solid-svg-icons'

import Favorites from './favorites';

import { DropdownButton,Dropdown } from 'react-bootstrap';

import ReactExport from 'react-export-excel';
import {
  //BrowserRouter as Router,
  HashRouter as Router,
  Route,
  NavLink,
  Redirect,
} from "react-router-dom";
//import groupBy from './groupBy';
import SimpleReactLightbox from 'simple-react-lightbox'
import { useToasts } from 'react-toast-notifications'



function App({data}) {
  //const {lat,lng,error} = useGeolocation(false,{enableHighAccuracy: true});
  const [searchCriteria, setSearchCriteria] = React.useState({});

  const [isFavoriteByPlantId, updateIsFavoriteByPlantId] = useLocalStorage('isFavoriteByPlantId', {});
  const favoritePlants = sortPlants(!searchCriteria.city ? 0 : searchCriteria.city.region)(data.plants.filter(p => !!isFavoriteByPlantId[p.id]));
  const isPlantFavorite = p => !!isFavoriteByPlantId[p.id];

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


  const favoriteAsSpreadsheets = (data,searchCriteria,favoritePlants) => {
    if(!searchCriteria.city){
      return [[],[]];
    }
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

            ].map((vm,i) => 
              <NavLink key={i} activeClassName="active" className="btn btn-outline-light" to={vm.to}>
                <FontAwesomeIcon icon={vm.icon} />
                <span className="ml-2" title={vm.tooltip}>
                  {vm.label}
                </span>
              </NavLink>
    
    )}
          </div>

          <DropdownButton title="Download" variant="outline-light">
            {downloadActions(data,searchCriteria,favoritePlants).map((a,i) => 
              <Dropdown.Item onClick={a.method} key={i}>
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
          <Favorites {...
            {
              favoritePlants
              ,downloadActions
              ,isPlantFavorite
              ,togglePlantFavorite
              ,searchCriteria
              ,data
            }}
            />
        </Route>
        {/*
        <Route exact="true" path="/search/(types)?/:types?" render={match => 
        */}
        <Route exact={true} path="/search" render={match => 
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