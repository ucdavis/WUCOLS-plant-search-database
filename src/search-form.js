import React from 'react';
import Select from 'react-select';
import Map from './Map';
import plantTypeCombinatorOptions from './plant-type-combinator-options';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faMap} from '@fortawesome/free-solid-svg-icons'

const MapModal = ({cities, visible, setVisible, onCityChange}) =>
    <>
    {visible && 
    <div
        className={"modal fade" + (visible ? " show" : "")} 
        style={{display: visible ? 'block' : 'none'}}
        id="mapModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true"
    >
        <div className="modal-dialog" style={{top:'30px'}}>
            <div className="modal-content" style={{width:'65vw',position:'fixed',left:'17vw'}}>
                <div className="modal-header">
                    <h5 className="modal-title" id="exampleModalLabel">City Map</h5>
                    <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={() => setVisible(false)}>
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div className="modal-body">
                    <Map cities={cities} onSelect={city => {
                        onCityChange(city);
                        setVisible(false);
                    }} />
                </div>
            </div>
        </div>
    </div>}
    </>;

const SearchForm = ({
    cityOptions,
    searchCriteria,
    plantTypes,
    waterUseClassifications,
    updateSearchCriteria
}) => {
    const [mapModalVisible,setMapModalVisible] = React.useState(false);
    const setPlantType = (code,checked) => 
        updateSearchCriteria({
            ...searchCriteria,
            pageNumber:1,
            plantTypes: {...searchCriteria.plantTypes, [code]: checked}
        });
    const selectAllWaterUseClassifications = (selected) => {
        updateSearchCriteria({
            ...searchCriteria,
            pageNumber:1,
            waterUseClassifications: waterUseClassifications.reduce((dict, wu) => {
                dict[wu.code] = selected;
                return dict;
            },{})
        });
    };
    const onCityChange = (o) => {
        //console.log('onCityChange',o);
        updateSearchCriteria({...searchCriteria, pageNumber:1, city: o});
    }
    const onPlantTypeCombinatorChange = (ptc) => {
        updateSearchCriteria({...searchCriteria, pageNumber:1, plantTypeCombinator: ptc});
    };
    const selectAllPlantTypes = (selected) => {
        updateSearchCriteria({
            ...searchCriteria,
            pageNumber:1,
            plantTypes: plantTypes.reduce((dict, pt) => {
                dict[pt.code] = selected;
                return dict;
            },{})
        });
    };
    const everythingElse = (<>
        <div className="form-group">
            <label><strong>Plant Name</strong></label>
            <input
                type="search"
                className="form-control"
                value={searchCriteria.name}
                placeholder="botanical or common name"
                onChange={e => updateSearchCriteria({ ...searchCriteria, pageNumber:1, name: e.target.value.toLowerCase() })}
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
                        onChange={e => updateSearchCriteria({
                             ...searchCriteria,
                             pageNumber:1,
                             waterUseClassifications: { ...searchCriteria.waterUseClassifications, [wu.code]: e.target.checked }
                        })}
                        id={wu.code + '_checkbox'} />
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
                    noOptionsMessage={() => "No result"} />
            </div>
            {plantTypes.map(pt => (
                <div className="form-check" key={pt.code}>
                    <input
                        className="form-check-input"
                        type="checkbox"
                        checked={searchCriteria.plantTypes[pt.code]}
                        onChange={e => setPlantType(pt.code, e.target.checked)}
                        id={pt.code + '_checkbox'} />
                    <label
                        className="form-check-label"
                        htmlFor={pt.code + '_checkbox'}
                    >
                        {pt.name}
                    </label>
                </div>
            ))}
        </div>
    </>);

    return (
        <div>
        <MapModal 
            visible={mapModalVisible} 
            setVisible={setMapModalVisible} 
            onCityChange={onCityChange}
            cities={cityOptions} />
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
            {' or '}
            <button className="btn btn-link btn-sm" onClick={() => setMapModalVisible(true)}>
                <FontAwesomeIcon icon={faMap} />
                {' '}
                Select city from map
            </button>
        </div>
        {!!searchCriteria.city ? everythingElse : <></>}
    </div>);
};

export default SearchForm;