import React from 'react';
import './App.css';
import Select from 'react-select';
import AsyncSelect from 'react-select/async';
import SimpleMap from './SimpleMap';
import {useGeolocation} from '../src/useGeolocation';
import useLocalStorage from './useLocalStorage';
import { CSVLink } from "react-csv";
import PlantList from './PlantList';
//import groupBy from './groupBy';
/*
import { CSVDownload } from "react-csv";
*/


function App({data}) {
  const {lat,lng,error} = useGeolocation(false,{enableHighAccuracy: true});
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

  const [isFavoriteByPlantId, updateIsFavoriteByPlantId] = useLocalStorage('isFavoriteByPlantId', {});
  const favoritePlants = data.plants.filter(p => !!isFavoriteByPlantId[p.id]);

  const togglePlantFavorite = p => {
    updateIsFavoriteByPlantId({...isFavoriteByPlantId, [p.id]: !isFavoriteByPlantId[p.id]})
  };

  const isPlantFavorite = p => !!isFavoriteByPlantId[p.id];

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

  const sortValueByWaterUseCode = {
    'VL': 1,
    'LO': 2,
    'M': 3,
    'H': 4,
    '?': 5,
    '/': 6
  };


  const getWaterUseSortValue = code => {
    return sortValueByWaterUseCode[code] || 99;
  };

  const matchingPlants = React.useMemo(
    () => data.plants.filter(p => {
      let typeOk = p.types.some(t => searchCriteria.plantTypes[t]);
      let wu = p.waterUseByRegion[searchCriteria.city.region - 1];
      let wuOk = searchCriteria.waterUseClassifications[wu];
      let nameOk = !searchCriteria.name || p.searchName.indexOf(searchCriteria.name) > -1;
      return wuOk && typeOk && nameOk;
    })
    .sort((plantA,plantB) => {
      let a = getWaterUseSortValue(plantA.waterUseByRegion[searchCriteria.city.region - 1]);
      let b = getWaterUseSortValue(plantB.waterUseByRegion[searchCriteria.city.region - 1]);
      return a < b ? -1 : a > b ? 1 : 0;
    })
    .slice(0,10),
    [data, searchCriteria]);


  const onCityChange = (o) => {
    //console.log('onCityChange',o);
    updateSearchCriteria({...searchCriteria, city: o});
  }


  const sampleRegion = 1;
  const sampleCsvData = 
    [
      ["ID", "Type(s)", "Botanical Name", "Common Name","Water Use", "Percentage of ET0"],
      ...data.plants.slice(0,10)
      .map(p => [
        p.id
        ,p.types.map(t => plantTypeNameByCode[t]).join(', ')
        ,p.botanicalName
        ,p.commonName
        ,waterUseByCode[p.waterUseByRegion[sampleRegion]].name
        ,waterUseByCode[p.waterUseByRegion[sampleRegion]].percentageET0
      ])
    ];

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
      {/*
      {types.map(t => <><span className="badge badge-secondary">{t}</span>{' '}</>)}
      */}
      
    </div>;

  const plantTypeOptions = data.plantTypes.map(t => ({label: t.name, value: t.code, key: t.code}));

  const isOptionSelected = o => {
    //console.log(o,searchCriteria.plantTypes[o.value]);
    return !!searchCriteria.plantTypes[o.value];
  }

  const setPlantType = (code,checked) => 
    updateSearchCriteria({...searchCriteria, plantTypes: {...searchCriteria.plantTypes, [code]: checked}});

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
      <div className="row">
        <div className="col-md-4">
          <h1>WUCOLS Database</h1>
        </div>
        <div className="col-md-1">
          <label className="form-control-label">
            Your City:
          </label>
        </div>
        <div className="col-md-4">
          <Select 
            options={cityOptions}
            placeholder="Select a city"
            autoFocus={true}
            value={searchCriteria.city}
            onChange={onCityChange}
            noOptionsMessage={() => "No cities found by that name"}/>
        </div>
      </div>
      <div className="row">
        <div className="col-md-4">
          <strong>{data.plants.length} species and counting</strong>
        </div>
        <div className="col-md-4">
          {
            favoritePlants.length === 0 
            ? "You don't have any favorites yet"
            : favoritePlants.length === 1
            ? "You have 1 favorite so far"
            : `You have ${favoritePlants.length} favorites so far`
          }
        </div>
      </div>
      <hr/>
      <div className="row">
        <div className="col-md-3">

          <h4>Plant Name</h4>
          <input 
            type="search"
            className="form-control"
            value={searchCriteria.name}
            placeholder="botanical name or common name"
            onChange={e => updateSearchCriteria({...searchCriteria, name: e.target.value.toLowerCase()}) }
            />

          <br/>

          <h4>Water Use</h4>
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

          <br/>

          <h4>Plant Types</h4> 
          <button class="btn btn-sm btn-link" onClick={() => selectAllPlantTypes()}>Select all</button>
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
        <div className="col-md-9">
          <PlantList 
            isPlantFavorite={isPlantFavorite}
            togglePlantFavorite={togglePlantFavorite}
            plants={matchingPlants} 
            plantTypeNameByCode={plantTypeNameByCode} 
            region={searchCriteria.city.region}
            waterUseByCode={waterUseByCode}/>
        </div>
      </div>


      <hr/>
      <CSVLink data={sampleCsvData} filename={`WUCOLS_Region_${sampleRegion}.csv`}>Download spreadshet</CSVLink>
      {/*
      <CSVDownload data={sampleCsvData} target="_blank">Download spreadshet</CSVDownload>
      */}
      <hr/>
      <div className="row">
        <div className="col-md-6">
          <h4>City</h4>
          <Select options={cityOptions}/>
          <br/>
          <h4>Plant Types</h4>
          <table className="table table-bordered table-sm">
            <thead>
              <tr>
                <th>Plant Type</th>
                <th>Abbreviation</th>
              </tr>
            </thead>
            <tbody>
              {data.plantTypes.map(pt => (
                <tr key={pt.code}>
                  <td>{pt.name}</td>
                  <td>{pt.code}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {data.plantTypes.map(pt => (
            <div className="form-check" key={pt.code}>
              <input 
                className="form-check-input"
                type="checkbox"
                checked={searchCriteria.plantTypes[pt.code]}
                onChange={e => updateSearchCriteria({...searchCriteria, plantTypes: {...searchCriteria.plantTypes, [pt.code]: e.target.checked}}) }
                id={pt.code + '_checkbox'}/>
              <label
                className="form-check-label"
                htmlFor={pt.code + '_checkbox'}>
                  {pt.name}
              </label>
            </div>
          ))}
        </div>
        <div className="col-md-6">
          <h4>Your Location</h4>
          <div>{lat + ", " + lng} {error}</div>

          <h4>Plant Names</h4>
          <div className="mb-1">Synchronous (slow)</div>
          <Select options={plantNameOptions}/>
          <div className="mb-1">Asynchronous (fast)</div>
          <AsyncSelect formatOptionLabel={formatPlantLabel} cacheOptions placeholder="Search plant names" loadOptions={plantNamePromiseOptions} noOptionsMessage={() => "No plant matches your search"}/>

          <h4>Water Use</h4>
          <table className="table table-bordered table-sm">
            <thead>
              <tr>
                <th>Category</th>
                <th>Abbreviation</th>
                <th>Percentage of ET<sub>0</sub></th>
              </tr>
            </thead>
            <tbody>
              {data.waterUseClassifications.map(pt => (
                <tr key={pt.code}>
                  <td>{pt.name}</td>
                  <td>{pt.code}</td>
                  <td>{pt.percentageET0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <hr/>
      {/*
        <div className="row row-cols-1 row-cols-md-2">
          {Object.keys(data.photos).map(pn => {
            let p = data.photos[pn];
            return (
              <div className="col mb-4" key={pn}>
                <div className="card">
                  <img className="card-img-top"
                    src={p.large.url}
                    alt={pn}/>
                  <div className="card-body">
                    <h5 className="card-title">{pn}</h5>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      */}

      <hr/>
      <SimpleMap />
    </div>
  );
}

export default App;