import React from 'react';
import './App.css';
import Select from 'react-select';
import AsyncSelect from 'react-select/async';
import SimpleMap from './SimpleMap';
import {useGeolocation} from '../src/useGeolocation';

const groupBy = (xs, key) =>
  xs.reduce((rv, x) => {
    let v = key instanceof Function ? key(x) : x[key];
    let el = rv.find((r) => r && r.key === v);
    if (el) {
      el.values.push(x);
    } else {
      rv.push({ key: v, values: [x] });
    }
    return rv; 
  }, []);

function App({data}) {
  const {lat,lng,error} = useGeolocation(false,{enableHighAccuracy: true});
  let cityOptions = data.cities.map(c => ({
    label: c.name,
    value: c.name,
    region: c.region
  }));

  const plantTypeNameByCode = 
    data.plantTypes.reduce((dict,t) => { dict[t.code] = t.name;
      return dict;
    },{});

  cityOptions = groupBy(cityOptions, c => "Region " + c.region)
  .map(g => ({label: g.key, options: g.values}))
  .sort((a,b) => a.label > b.label ? 1 : a.label < b.label ? -1 : 0);

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
              <span key={t} className="badge badge-secondary">{plantTypeNameByCode[t]}</span>
              {' '}
            </>
          )}
        </>
      }
      {/*
      {types.map(t => <><span className="badge badge-secondary">{t}</span>{' '}</>)}
      */}
      
    </div>;

  return (
    <div className="App">
      <h1>WUCOLS Database</h1>
      <strong>{data.plants.length} species and counting</strong>
      <hr/>
      <div className="row">
        <div className="col-md-6">
          <h4>City</h4>
          <Select options={cityOptions}/>
          <br/>
          <h4>Plant Types</h4>
          <table className="table table-bordered table-sm">
            <thead>
              <th>Plant Type</th>
              <th>Abbreviation</th>
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
              <th>Category</th>
              <th>Abbreviation</th>
              <th>Percentage of ET<sub>0</sub></th>
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
          {data.waterUseClassifications.map(pt => (
            <div className="form-check" key={pt.code}>
              <input 
                className="form-check-input"
                type="checkbox"
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
      <hr/>
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
      <ul className="list-unstyled">
        {Object.keys(data.photos).map(pn => {
          let p = data.photos[pn];
          return (
            <li className="media" key={pn}>
              <img className="mr-3"
                src={p.small.url}
                height={p.small.height}
                width={p.small.width} 
                alt={pn}/>
              <div className="media-body">
                <h5 className="mt-0 mb-1">{pn}</h5>
              </div>
            </li>
          );
        })}
      </ul>
      <hr/>
      <SimpleMap />
    </div>
  );
}

export default App;