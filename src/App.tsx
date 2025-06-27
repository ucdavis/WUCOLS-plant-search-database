import { useCallback } from "react";
import "./App.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Map from "./Search/Map";
//import {useGeolocation} from '../src/useGeolocation';
import useLocalStorage from "./Utilities/useLocalStorage";
import sortPlants from "./Search/sort-plants";
import Search from "./Search/Search";
import PlantDetail from "./Plant/PlantDetail";
import BenchCardViewer from "./Plant/BenchCardViewer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faStar,
} from "@fortawesome/free-solid-svg-icons";

import Favorites from "./Favorites/Favorites";

import {
  Routes,
  Route,
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { Navigate } from "react-router-dom";

import SearchCriteriaConverter from "./Search/search-criteria-converter";

import {
  BoolDict,
  City,
  Data,
  Plant,
  SearchCriteria,
} from "./types";

interface Props {
  data: Data;
}

function App({ data }: Props) {
  //const {lat,lng,error} = useGeolocation(false,{enableHighAccuracy: true});
  const location = useLocation();
  const navigate = useNavigate();
  const searchCriteria = SearchCriteriaConverter.initSearchCriteria(
    location.search,
    data.cityOptions,
    data.plantTypes
  );

  const searchWasPerformed = (sc: SearchCriteria) =>
    Object.values(sc.waterUseClassifications).some((b) => b) ||
    Object.values(sc.plantTypes).some((b) => b) ||
    sc.name.length > 0;

  const resetSearchCriteria = () =>
    updateSearchCriteria(
      SearchCriteriaConverter.getDefaultSearchCriteria(data.plantTypes)
    );

  const updateSearchCriteria = useCallback(
    (sc: SearchCriteria) => {
      let qs = SearchCriteriaConverter.toQuerystring(sc);
      //console.log('search altered',qs);
      if (!navigate) {
        //console.log('no history')
        //return;
      }
      //console.log(history)
      navigate({
        pathname: "/search",
        search: qs,
      });
      //console.log(sc);
    },
    [navigate]
  );

  const [isFavoriteByPlantId, updateIsFavoriteByPlantId] =
    useLocalStorage<BoolDict>("isFavoriteByPlantId", {});
  const favoritePlants = sortPlants(
    !searchCriteria.city ? 0 : searchCriteria.city.region
  )(data.plants.filter((p) => !!isFavoriteByPlantId[p.id]));
  const isPlantFavorite = (p: Plant) => !!isFavoriteByPlantId[p.id];

  const addAllToFavorites = (plants: Plant[]) => {
    const original = { ...isFavoriteByPlantId };
    const amended = {
      ...original,
      ...Object.fromEntries(plants.map((p) => [p.id, true])),
    };
    updateIsFavoriteByPlantId(amended);

    let thisToastId: string | number = "";
    thisToastId = toast.info(
      <div>
        Added {plants.length} favorites
        <button
          className="btn btn-link"
          onClick={() => {
            updateIsFavoriteByPlantId(original);
            toast.dismiss(thisToastId);
          }}
        >
          UNDO
        </button>
      </div>,
      { autoClose: false }
    );
  };

  const clearAllFavorites = () => {
    const clearedDict = Object.fromEntries(
      favoritePlants.map((p) => [p.id, false])
    );
    const unclearedDict = Object.fromEntries(
      favoritePlants.map((p) => [p.id, true])
    );
    updateIsFavoriteByPlantId(clearedDict);

    let thisToastId: string | number = "";
    thisToastId = toast.info(
      <div>
        Cleared favorites
        <button
          className="btn btn-link"
          onClick={() => {
            updateIsFavoriteByPlantId(unclearedDict);
            toast.dismiss(thisToastId);
          }}
        >
          UNDO
        </button>
      </div>,
      { autoClose: false }
    );
  };

  const togglePlantFavorite = (p: Plant) => {
    const isFavoriteNow = !isFavoriteByPlantId[p.id];
    updateIsFavoriteByPlantId({
      ...isFavoriteByPlantId,
      [p.id]: isFavoriteNow,
    });

    let thisToastId: string | number = "";
    thisToastId = toast.info(
      <div>
        Plant {isFavoriteNow ? "added to" : "removed from"} favorites
        <button
          className="btn btn-link"
          onClick={() => {
            updateIsFavoriteByPlantId({
              ...isFavoriteByPlantId,
              [p.id]: !isFavoriteNow,
            });
            toast.dismiss(thisToastId);
          }}
        >
          UNDO
        </button>
      </div>,
      { autoClose: false }
    );
  };

  return (
    <>
      <ToastContainer position="bottom-center" />
      <div className="App">
        <nav className="navbar navbar-dark bg-dark sticky-top d-flex justify-content-between">
          <div className="btn-group">
            {[
              {
                label: "Search",
                icon: faSearch,
                to: "/search" + location.search,
              },
              {
                label: `Favorites (${favoritePlants.length})`,
                icon: faStar,
                to: "/favorites" + location.search,
                tooltip: "Download options available",
              },
            ].map((vm, i) => {
              return (
                <NavLink
                  key={i}
                  className={({ isActive }) =>
                    "btn btn-outline-light" + (isActive ? " active" : "")
                  }
                  to={vm.to}
                >
                  <FontAwesomeIcon icon={vm.icon} />
                  <span className="ml-2" title={vm.tooltip}>
                    {vm.label}
                  </span>
                </NavLink>
              );
            })}
          </div>

          {!!searchCriteria.city && (
            <button
              className="btn btn-outline-light"
              onClick={() => resetSearchCriteria()}
            >
              Clear Search Form (Start over)
            </button>
          )}

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
        <Routes>
          <Route path="/" element={<Navigate to="/search" replace />} />
          <Route
            path="/map"
            element={
              <div>
                <Map
                  cities={data.cities}
                  onSelect={(city: City) => {
                    alert(city.name);
                  }}
                />
              </div>
            }
          />
          <Route
            path="/plant/:plantId/benchcard/:templateId"
            element={
              <BenchCardViewer data={data} />
            }
          />
          <Route
            path="/plant/:plantId"
            element={
              // You may need to use useParams inside a wrapper component to get plantId
              <PlantDetailWrapper
                data={data}
                searchCriteria={searchCriteria}
                togglePlantFavorite={togglePlantFavorite}
                isPlantFavorite={isPlantFavorite}
              />
            }
          />
          <Route
            path="/favorites"
            element={
              <Favorites
                favoritePlants={favoritePlants}
                queryString={location.search}
                isPlantFavorite={isPlantFavorite}
                togglePlantFavorite={togglePlantFavorite}
                searchCriteria={searchCriteria}
                clearAllFavorites={clearAllFavorites}
                data={data}
              />
            }
          />
          <Route
            path="/search"
            element={
              <Search
                queryString={location.search}
                searchCriteria={searchCriteria}
                isPlantFavorite={isPlantFavorite}
                togglePlantFavorite={togglePlantFavorite}
                setSearchCriteria={updateSearchCriteria}
                data={data}
                searchPerformed={searchWasPerformed(searchCriteria)}
                addAllToFavorites={addAllToFavorites}
              />
            }
          />
        </Routes>
      </div>
    </>
  );
}

// PlantDetailWrapper needed to use useParams for plantId
import { useParams } from "react-router-dom";
interface PlantDetailWrapperProps {
  data: Data;
  searchCriteria: SearchCriteria;
  togglePlantFavorite: (p: Plant) => void;
  isPlantFavorite: (p: Plant) => boolean;
}

const PlantDetailWrapper = ({
  data,
  searchCriteria,
  togglePlantFavorite,
  isPlantFavorite,
}: PlantDetailWrapperProps) => {
  const { plantId } = useParams();
  const id = parseInt(plantId || "");
  let plant = data.plants.filter(
    (p) => p.id === id || p.url_keyword === plantId
  )[0];
  if (!plant) {
    return <div className="container-fluid my-5">No plant found by that ID</div>;
  }
  return (
    <div className="container-fluid">
      <PlantDetail
        plant={plant}
        benchCardTemplates={data.benchCardTemplates}
        plantTypeNameByCode={data.plantTypeNameByCode}
        waterUseByCode={data.waterUseByCode}
        region={!!searchCriteria.city ? searchCriteria.city.region : 0}
        togglePlantFavorite={togglePlantFavorite}
        isPlantFavorite={isPlantFavorite}
        regions={data.regions}
      />
    </div>
  );
};

export default App;
