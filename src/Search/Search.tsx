import React from "react";
import PlantList from "../Plant/PlantList";
import PlantTable from "../Plant/PlantTable";
import {
  faTh,
  faThLarge,
  faBars,
  IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import sortPlants from "./sort-plants";
import ultimatePagination from "ultimate-pagination";
import { Pagination } from "react-bootstrap";
import plantTypeCombinatorOptions from "../Plant/plant-type-combinator-options";
import SearchForm from "./SearchForm";
import SearchCriteriaConverter from "./search-criteria-converter";
import Welcome from "./Welcome";
import { Data, DownloadAction, Plant, SearchCriteria } from "../types";
import DownloadActionList from '../Download/DownloadActionList';

const performancePlantLimit = 50000;

interface Props {
  data: Data;
  searchCriteria: SearchCriteria;
  searchPerformed: boolean;
  setSearchCriteria: (searchCriteria: SearchCriteria) => void;
  downloadActions: DownloadAction[];
  isPlantFavorite: (plant: Plant) => boolean;
  addAllToFavorites: (plants: Plant[]) => void;
  togglePlantFavorite: (plant: Plant) => void;
  queryString: string;
  resetSearchCriteria: () => void;
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
  downloadActions,
  searchPerformed,
  setSearchCriteria,
  isPlantFavorite,
  togglePlantFavorite,
  queryString,
  resetSearchCriteria,
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
  const [plantsViewModeId] = React.useState(plantsViewModes[0].id);
  const plantsViewMode =
    plantsViewModes.filter((vm) => vm.id === plantsViewModeId)[0] ||
    plantsViewModes[0];

  const matchingPlants = React.useMemo(() => {
    let noType = Object.values(searchCriteria.plantTypes).every((b) => !b);
    let noWu = Object.values(searchCriteria.waterUseClassifications).every(
      (b) => !b
    );
    let types = Object.entries(searchCriteria.plantTypes)
      .filter(([k, v]) => !!v)
      .map(([k, v]) => k);
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

  const pageSize = 50;
  const pageCount = Math.max(1, Math.ceil(matchingPlants.length / pageSize));
  const currentPage = pageCount > 0 ? searchCriteria.pageNumber : 1;
  var paginationModel = ultimatePagination.getPaginationModel({
    // Required
    currentPage,
    totalPages: pageCount,

    // Optional
    boundaryPagesRange: 1,
    siblingPagesRange: 1,
    hideEllipsis: false,
    hidePreviousAndNextPageLinks: false,
    hideFirstAndLastPageLinks: false,
  });
  //console.log('pagination',paginationModel);

  const setCurrentPageNumber = (pn: number) =>
    setSearchCriteria({ ...searchCriteria, pageNumber: pn });
  const actualPagination = pageCount > 1 && (
    <Pagination>
      {paginationModel
        .map((p) => {
          const props = {
            key: p.key,
            active: p.isActive,
            onClick: () => setCurrentPageNumber(p.value),
          };
          switch (p.type) {
            //case 'PREVIOUS_PAGE_LINK': return <Pagination.Prev {...props}/>
            //case 'NEXT_PAGE_LINK'    : return <Pagination.Next {...props}/>
            case "PAGE":
              return <Pagination.Item {...props}>{p.value}</Pagination.Item>;
            case "ELLIPSIS":
              return <Pagination.Ellipsis {...props} />;
            default:
              return undefined;
          }
        })
        .filter((f) => !!f)}
    </Pagination>
  );

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
              <DownloadActionList downloadActions={downloadActions} />}
          </div>
        </nav>

        <main className="col-sm-7 col-lg-8 col-xl-9 ml-sm-auto" role="main">
          {!searchPerformed ? (
            <Welcome />
          ) : (
            <>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>Matching Plants: {matchingPlants.length}</div>
                {/*
              <pre>{JSON.stringify({paginationModel,currentPageNumber,pageCount}, null, 2)}</pre>
            */}
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
                  plants={matchingPlants.slice(
                    (searchCriteria.pageNumber - 1) * pageSize,
                    (searchCriteria.pageNumber + 1) * pageSize
                  )}
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
