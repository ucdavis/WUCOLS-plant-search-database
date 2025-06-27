import { useState, useMemo } from "react";
import PlantList from "../Plant/PlantList";
import PlantTable from "../Plant/PlantTable";
import {
  faTh,
  faThLarge,
  faBars,
  IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import sortPlants from "./sort-plants";
import plantTypeCombinatorOptions from "../Plant/plant-type-combinator-options";
import SearchForm from "./SearchForm";
import Welcome from "./Welcome";
import { Data, Plant, SearchCriteria } from "../types";
import DownloadMenu from '../Download/DownloadMenu';
import {getPlantPaginationProps, PlantPagination} from '../Plant/PlantPagination';

const performancePlantLimit = 50000;

interface Props {
  data: Data;
  searchCriteria: SearchCriteria;
  searchPerformed: boolean;
  setSearchCriteria: (searchCriteria: SearchCriteria) => void;
  isPlantFavorite: (plant: Plant) => boolean;
  addAllToFavorites: (plants: Plant[]) => void;
  togglePlantFavorite: (plant: Plant) => void;
  queryString: string;
}

export interface PlantsViewMode {
  id: string;
  label: string;
  component: React.ComponentType<any>;
  icon: IconDefinition;
}

const Search = ({
  data,
  searchCriteria,
  searchPerformed,
  setSearchCriteria,
  isPlantFavorite,
  togglePlantFavorite,
  queryString,
  addAllToFavorites
}: Props) => {
  let plantsViewModes: PlantsViewMode[] = [
    {
      id: "list",
      label: "List",
      component: PlantTable,
      icon: faBars,
    },
    {
      id: "grid",
      label: "Grid",
      component: (props) =>
        PlantList({ ...props, className: "col-sm-12 col-lg-6 col-xl-6" }),
      icon: faThLarge,
    },
    {
      id: "dense-grid",
      label: "Dense Grid",
      component: (props) =>
        PlantList({ ...props, className: "col-sm-12 col-lg-6 col-xl-4" }),
      icon: faTh,
    },
  ];
  const [plantsViewModeId] = useState(plantsViewModes[0].id);
  const plantsViewMode =
    plantsViewModes.filter((vm) => vm.id === plantsViewModeId)[0] ||
    plantsViewModes[0];

  const matchingPlants = useMemo(() => {
    let noType = Object.values(searchCriteria.plantTypes).every((b) => !b);
    let noWu = Object.values(searchCriteria.waterUseClassifications).every(
      (b) => !b
    );
    let types = Object.entries(searchCriteria.plantTypes)
      .filter(([_, v]) => !!v)
      .map(([k, _]) => k);
    let typeFn =
      searchCriteria.plantTypeCombinator ===
      plantTypeCombinatorOptions.byId["ANY"]
        ? types.some.bind(types)
        : types.every.bind(types);
    //console.log(types);
    if (!searchCriteria.city) {
      return [];
    }
    return sortPlants(searchCriteria.city.region)(
      data.plants.filter((p) => {
        let typeOk = noType || typeFn((t) => p.types.indexOf(t) > -1);
        if (!searchCriteria.city) {
          return false;
        }
        let wu = p.waterUseByRegion[searchCriteria.city.region - 1];
        let wuOk = searchCriteria.waterUseClassifications[wu] || noWu;
        let nameOk =
          !searchCriteria.name ||
          p.searchName.indexOf(searchCriteria.name) > -1;
        return wuOk && typeOk && nameOk;
      })
    ).slice(0, performancePlantLimit);
  }, [data, searchCriteria]);

  const plantPaginationProps = getPlantPaginationProps(
    50,
    matchingPlants.length,
    searchCriteria.pageNumber, 
    (pn: number) => setSearchCriteria({ ...searchCriteria, pageNumber: pn }));

  const actualPagination = PlantPagination({...plantPaginationProps});

  return (
    <div className="container-fluid">
      {/*
    <div>
      <pre>{JSON.stringify(match,null,2)}</pre>
    </div>
    */}
      <div className="row">
        <nav className="col-sm-5 col-lg-4 col-xl-3 sidebar bg-light">
          <div className="sidebar-sticky p-3">
            <SearchForm
              waterUseClassifications={data.waterUseClassifications}
              plantTypes={data.plantTypes}
              cityOptions={data.cityOptions}
              searchCriteria={searchCriteria}
              updateSearchCriteria={setSearchCriteria}
            />
            {!searchCriteria.city &&
              <DownloadMenu {...{searchCriteria,data, plants:data.plants}} />
            }
          </div>
        </nav>

        <main className="col-sm-7 col-lg-8 col-xl-9 ml-sm-auto" role="main">
          {!searchPerformed ? (
            <Welcome />
          ) : (
            <>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>Matching Plants: {matchingPlants.length}</div>
              </div>
              <div className="clearfix">
                <button
                  className="btn btn-sm btn-primary float-right"
                  onClick={() => addAllToFavorites(matchingPlants)}
                >Add all matches to favorites</button>
                {actualPagination}
              </div>
              {!searchCriteria.city ? (
                <div>Please select a city</div>
              ) : (
                <plantsViewMode.component
                  queryString={queryString}
                  isPlantFavorite={isPlantFavorite}
                  togglePlantFavorite={togglePlantFavorite}
                  plants={plantPaginationProps.getCurrentItems(matchingPlants)}
                  photosByPlantName={data.photos}
                  plantTypeNameByCode={data.plantTypeNameByCode}
                  region={searchCriteria.city.region}
                  waterUseByCode={data.waterUseByCode}
                />
              )}
              {actualPagination}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Search;
