import React from "react";
import Select, { ActionMeta, ValueType } from "react-select";
import Map from "./Map";
import plantTypeCombinatorOptions from "../Plant/plant-type-combinator-options";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMap } from "@fortawesome/free-solid-svg-icons";
import {
  BoolDict,
  City,
  PlantType,
  PlantTypeCombinator,
  SearchCriteria,
  WaterUseClassification,
} from "../types";

interface MapModalProps {
  cities: City[];
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  onCityChange: (city: City) => void;
}

const MapModal = ({
  cities,
  visible,
  setVisible,
  onCityChange,
}: MapModalProps) => (
  <>
    {visible && (
      <div
        className={"modal fade" + (visible ? " show" : "")}
        style={{ display: visible ? "block" : "none" }}
        id="mapModal"
        tabIndex={-1}
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog" style={{ top: "30px" }}>
          <div
            className="modal-content"
            style={{ width: "65vw", position: "fixed", left: "17vw" }}
          >
            <div className="modal-header">
              <h5 className="modal-title" id="exampleModalLabel">
                City Map
              </h5>
              <button
                type="button"
                className="close"
                data-dismiss="modal"
                aria-label="Close"
                onClick={() => setVisible(false)}
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <Map
                cities={cities}
                onSelect={(city: City) => {
                  onCityChange(city);
                  setVisible(false);
                }}
              />
            </div>
          </div>
        </div>
      </div>
    )}
  </>
);

interface SearchFormProps {
  cityOptions: City[];
  searchCriteria: SearchCriteria;
  plantTypes: PlantType[];
  waterUseClassifications: WaterUseClassification[];
  updateSearchCriteria: (searchCriteria: SearchCriteria) => void;
}

const SearchForm = ({
  cityOptions,
  searchCriteria,
  plantTypes,
  waterUseClassifications,
  updateSearchCriteria,
}: SearchFormProps) => {
  const [mapModalVisible, setMapModalVisible] = React.useState(false);
  const setPlantType = (code: string, checked: boolean) =>
    updateSearchCriteria({
      ...searchCriteria,
      pageNumber: 1,
      plantTypes: { ...searchCriteria.plantTypes, [code]: checked },
    });
  const selectAllWaterUseClassifications = (selected: boolean) => {
    updateSearchCriteria({
      ...searchCriteria,
      pageNumber: 1,
      waterUseClassifications: waterUseClassifications.reduce(
        (dict: BoolDict, wu) => {
          dict[wu.code] = selected;
          return dict;
        },
        {}
      ),
    });
  };
  const onCityChange = (o: City) => {
    //console.log('onCityChange',o);
    updateSearchCriteria({ ...searchCriteria, pageNumber: 1, city: o });
  };
  const onPlantTypeCombinatorChange = (ptc: PlantTypeCombinator) => {
    updateSearchCriteria({
      ...searchCriteria,
      pageNumber: 1,
      plantTypeCombinator: ptc,
    });
  };
  const selectAllPlantTypes = (selected: boolean) => {
    updateSearchCriteria({
      ...searchCriteria,
      pageNumber: 1,
      plantTypes: plantTypes.reduce((dict: BoolDict, pt) => {
        dict[pt.code] = selected;
        return dict;
      }, {}),
    });
  };
  const everythingElse = (
    <>
      <div className="form-group">
        <label>
          <strong>Plant Name</strong>
        </label>
        <input
          type="search"
          className="form-control"
          value={searchCriteria.name}
          placeholder="botanical or common name"
          onChange={(e) =>
            updateSearchCriteria({
              ...searchCriteria,
              pageNumber: 1,
              name: e.target.value.toLowerCase(),
            })
          }
        />
      </div>
      <div className="form-group">
        <label className="form-label">
          <strong>Water Use</strong>
        </label>
        <div>
          <button
            className="btn btn-sm btn-link"
            onClick={() => selectAllWaterUseClassifications(true)}
          >
            Select all
          </button>
          /{" "}
          <button
            className="btn btn-sm btn-link"
            onClick={() => selectAllWaterUseClassifications(false)}
          >
            Deselect all
          </button>
        </div>
        {waterUseClassifications.map((wu) => (
          <div className="form-check" key={wu.code}>
            <input
              className="form-check-input"
              type="checkbox"
              checked={searchCriteria.waterUseClassifications[wu.code]}
              onChange={(e) =>
                updateSearchCriteria({
                  ...searchCriteria,
                  pageNumber: 1,
                  waterUseClassifications: {
                    ...searchCriteria.waterUseClassifications,
                    [wu.code]: e.target.checked,
                  },
                })
              }
              id={wu.code + "_checkbox"}
            />
            <label className="form-check-label" htmlFor={wu.code + "_checkbox"}>
              {wu.name}
            </label>
          </div>
        ))}
      </div>
      <div className="form-group">
        <label className="form-label">
          <strong>Plant Types</strong>
        </label>
        <div>
          <button
            className="btn btn-sm btn-link"
            onClick={() => selectAllPlantTypes(true)}
          >
            Select all
          </button>
          /
          <button
            className="btn btn-sm btn-link"
            onClick={() => selectAllPlantTypes(false)}
          >
            Deselect all
          </button>
        </div>
        <div>
          <Select
            styles={{
              container: (base: any) => ({
                ...base,
                flex: 1,
              }),
            }}
            options={plantTypeCombinatorOptions.array}
            value={searchCriteria.plantTypeCombinator}
            onChange={
              onPlantTypeCombinatorChange as (
                o: ValueType<PlantTypeCombinator, false>,
                _: ActionMeta<PlantTypeCombinator>
              ) => void
            }
            noOptionsMessage={() => "No result"}
          />
        </div>
        {plantTypes.map((pt) => (
          <div className="form-check" key={pt.code}>
            <input
              className="form-check-input"
              type="checkbox"
              checked={searchCriteria.plantTypes[pt.code] || false}
              onChange={(e) => setPlantType(pt.code, e.target.checked)}
              id={pt.code + "_checkbox"}
            />
            <label className="form-check-label" htmlFor={pt.code + "_checkbox"}>
              {pt.name}
            </label>
          </div>
        ))}
      </div>
    </>
  );

  return (
    <div>
      <MapModal
        visible={mapModalVisible}
        setVisible={setMapModalVisible}
        onCityChange={onCityChange}
        cities={cityOptions}
      />
      <div className="form-group">
        <label>
          <strong>City/Region</strong>
          <br />
          Start typing to search
        </label>
        <Select
          styles={{
            container: (base: any) => ({
              ...base,
              flex: 1,
            }),
          }}
          options={cityOptions}
          placeholder="Select a city"
          value={searchCriteria.city}
          onChange={
            onCityChange as (
              o: ValueType<City, false>,
              _: ActionMeta<City>
            ) => void
          }
          noOptionsMessage={() => "No cities found by that name"}
        />
        {" or "}
        <button
          className="btn btn-link btn-sm"
          onClick={() => setMapModalVisible(true)}
        >
          <FontAwesomeIcon icon={faMap} /> Select city from map
        </button>
      </div>
      {!!searchCriteria.city ? everythingElse : <></>}
    </div>
  );
};

export default SearchForm;
