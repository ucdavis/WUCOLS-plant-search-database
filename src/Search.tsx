import React from "react";
import PlantList from "./PlantList";
import PlantTable from "./PlantTable";
import {
  faTh,
  faThLarge,
  faBars,
  IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import sortPlants from "./sort-plants";
import ultimatePagination from "ultimate-pagination";
import { Pagination } from "react-bootstrap";
import plantTypeCombinatorOptions from "./plant-type-combinator-options";
import SearchForm from "./search-form";
import SearchCriteriaConverter from "./SearchCriteriaConverter";
import Welcome from "./welcome";
import { Data, Plant, SearchCriteria } from "./types";

const performancePlantLimit = 50000;

interface Props {
  data: Data;
  searchCriteria: SearchCriteria;
  setSearchCriteria: (searchCriteria: SearchCriteria) => void;
  isPlantFavorite: (plant: Plant) => boolean;
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
  setSearchCriteria,
  isPlantFavorite,
  togglePlantFavorite,
  queryString,
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

  const resetSearchCriteria = () =>
    setSearchCriteria(
      SearchCriteriaConverter.getDefaultSearchCriteria(data.plantTypes)
    );

  const searchPerformed =
    Object.values(searchCriteria.waterUseClassifications).some((b) => b) ||
    Object.values(searchCriteria.plantTypes).some((b) => b) ||
    searchCriteria.name.length > 0;

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
        <nav className="col-sm-4 col-lg-3 col-xl-2 sidebar bg-light">
          <div className="sidebar-sticky p-3">
            <SearchForm
              waterUseClassifications={data.waterUseClassifications}
              plantTypes={data.plantTypes}
              cityOptions={data.cityOptions}
              searchCriteria={searchCriteria}
              updateSearchCriteria={setSearchCriteria}
            />
          </div>
        </nav>

        <main className="col-sm-8 col-lg-9 col-xl-10 ml-sm-auto" role="main">
          {!searchPerformed ? (
            <Welcome />
          ) : (
            <>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>Matching Plants: {matchingPlants.length}</div>

                {searchPerformed && (
                  <button
                    className="btn btn-link"
                    onClick={() => resetSearchCriteria()}
                  >
                    Clear Search Form (Start over)
                  </button>
                )}
                {/*
              <pre>{JSON.stringify({paginationModel,currentPageNumber,pageCount}, null, 2)}</pre>
            */}
              </div>
              {actualPagination}
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
