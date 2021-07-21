import React from 'react';
import Select from 'react-select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar, faTint } from '@fortawesome/free-solid-svg-icons'
import {
  Link
} from "react-router-dom";

const SearchForm = ({
    cityOptions,
    updateSearchCriteria,
    searchCriteria,
    plantTypes,
    waterUseClassifications
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
          <label><strong>City/Region</strong></label>
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
          <label><strong>Plant Name</strong></label>
          <input 
            type="search"
            className="form-control"
            value={searchCriteria.name}
            placeholder="botanical name or common name"
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
  }

export default SearchForm;