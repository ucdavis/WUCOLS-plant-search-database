import React from 'react';
import './App.css';
import Select from 'react-select';
//import {useGeolocation} from '../src/useGeolocation';
import useLocalStorage from './useLocalStorage';
import { CSVLink } from "react-csv";
import PlantList from './PlantList';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFileExcel } from '@fortawesome/free-solid-svg-icons'
//import groupBy from './groupBy';

const getWaterUseSortValue = (() => {
  const sortValueByWaterUseCode = { 'VL': 1, 'LO': 2, 'M': 3, 'H': 4, '?': 5, '/': 6 };
  return code => {
    return sortValueByWaterUseCode[code] || 99;
  };
})();

function App({data}) {
  //const {lat,lng,error} = useGeolocation(false,{enableHighAccuracy: true});
  
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

  const [searchCriteria, updateSearchCriteria] = React.useState({
    city: cityOptions[0],
    name: '',
    waterUseClassifications: {
      'VL':true,
      'LO': true,
      'M': true,
      'H': true,
      '?': true,
      '/': true
    },
    plantTypes: data.plantTypes.reduce((dict, pt) => {
      dict[pt.code] = pt.code === 'A';
      return dict;
    },{})
  });

  const [isFavoriteByPlantId, updateIsFavoriteByPlantId] = useLocalStorage('isFavoriteByPlantId', {});
  const favoritePlants = sortPlants(data.plants.filter(p => !!isFavoriteByPlantId[p.id]));

  const togglePlantFavorite = p => {
    updateIsFavoriteByPlantId({...isFavoriteByPlantId, [p.id]: !isFavoriteByPlantId[p.id]})
  };

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


  const onCityChange = (o) => {
    //console.log('onCityChange',o);
    updateSearchCriteria({...searchCriteria, city: o});
  }


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

  /*
  let plantNameOptions = data.plants.map(p => ({
    ...p,
    label: p.botanicalName + ' / ' + p.commonName,
    value: p.id
  }));
  let plantNamePromiseOptions = inputValue =>
    new Promise(resolve => {
      if(inputValue.length < 3){
        resolve([]);
      }
      let term = inputValue.toLowerCase();
      let matchingPlants = plantNameOptions.filter(p => p.label.toLowerCase().indexOf(term) > -1);
      resolve(matchingPlants);
    });
  const formatPlantLabel = ({commonName, botanicalName, waterUseByRegion, types}, context) => 
    <div key={commonName}>
      {commonName} {' '} <i>({botanicalName})</i>
      { context === 'value'
      ? <></>
      : <>
          <br/>
          {types.map(t =>
            <>
              <span key={t} className="badge badge-secondary">
                {plantTypeNameByCode[t]}
              </span>
              {' '}
            </>
          )}
        </>
      }
      {types.map(t => <><span className="badge badge-secondary">{t}</span>{' '}</>)}
    </div>;
  */

  const setPlantType = (code,checked) => 
    updateSearchCriteria({...searchCriteria, plantTypes: {...searchCriteria.plantTypes, [code]: checked}});

  const selectAllWaterUseClassifications = () => {
    updateSearchCriteria({
      ...searchCriteria,
      waterUseClassifications: data.waterUseClassifications.reduce((dict, wu) => {
        dict[wu.code] = true;
        return dict;
      },{})
    });
  };

  const selectAllPlantTypes = () => {
    updateSearchCriteria({
      ...searchCriteria,
      plantTypes: data.plantTypes.reduce((dict, pt) => {
        dict[pt.code] = true;
        return dict;
      },{})
    });
  };

  return (
    <div className="App">
      <nav className="navbar navbar-dark bg-dark sticky-top navbar-light bg-light">
        <a className="navbar-brand" href="https://ucanr.edu/sites/wucols">WUCOLS Plant Search Database</a>

        <form className="form-inline">
          <div className="form-group">
            <span className="text-light mr-3">
              {
                favoritePlants.length === 0 
                ? "You don't have any favorites yet."
                : favoritePlants.length === 1
                ? "You have 1 favorite so far."
                : `You have ${favoritePlants.length} favorites so far.`
              }
              {' '}
            </span>
            {
              !!favoritePlants.length
              &&
              <CSVLink
                className="btn btn-success"
                data={favoritesCsvData}
                filename={`WUCOLS_${searchCriteria.city.name}.csv`}>
                  <FontAwesomeIcon icon={faFileExcel} className="mr-2"/>
                  Download as a spreadsheet
              </CSVLink>
            }
          </div>
        </form>
      </nav>
      <div className="container-fluid">
        <div className="row">
          <nav className="col-sm-4 col-lg-3 col-xl-2 sidebar bg-light">
            <div className="sidebar-sticky p-3"  >
              <p>{data.plants.length} species and counting</p>

              <div className="form-group">
                <label>City/Region</label>
                <Select 
                  styles={{
                    container: base => ({
                      ...base,
                      flex: 1
                    })
                  }}
                  options={cityOptions}
                  placeholder="Select a city"
                  autoFocus={true}
                  value={searchCriteria.city}
                  onChange={onCityChange}
                  noOptionsMessage={() => "No cities found by that name"}/>
              </div>

              <div className="form-group">
                <label>Plant Name</label>
                <input 
                  type="search"
                  className="form-control"
                  value={searchCriteria.name}
                  placeholder="botanical name or common name"
                  onChange={e => updateSearchCriteria({...searchCriteria, name: e.target.value.toLowerCase()}) }
                  />
              </div>

              <div className="form-group">
                <button
                  className="btn btn-sm btn-link float-right"
                  onClick={() => selectAllWaterUseClassifications()}>
                    Select all
                </button>

                <label>Water Use</label>

                {data.waterUseClassifications.map(wu => (
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
                <button
                  className="btn btn-sm btn-link float-right"
                  onClick={() => selectAllPlantTypes()}>
                    Select all
                </button>

                <label>Plant Types</label> 

                {data.plantTypes.map(pt => (
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

          </nav>

          <main className="col-sm-8 col-lg-9 col-xl-10 ml-sm-auto" role="main">
              <p>
                Matching Plants: {matchingPlants.length}
              </p>
            <PlantList 
              isPlantFavorite={isPlantFavorite}
              togglePlantFavorite={togglePlantFavorite}
              plants={matchingPlants} 
              plantTypeNameByCode={plantTypeNameByCode} 
              region={searchCriteria.city.region}
              waterUseByCode={waterUseByCode}/>
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;