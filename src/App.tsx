import React from "react";
import "./App.css";
import Map from "./Search/Map";
//import {useGeolocation} from '../src/useGeolocation';
import useLocalStorage from "./Utilities/useLocalStorage";
import sortPlants from "./Search/sort-plants";
import Search from "./Search/Search";
import PlantDetail from "./Plant/PlantDetail";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import { PDFViewer } from "@react-pdf/renderer";

import Favorites from "./Favorites/Favorites";

import {
  //BrowserRouter as Router,
  useLocation,
  useHistory,
  Route,
  NavLink,
  Redirect,
} from "react-router-dom";

import SimpleReactLightbox from "simple-react-lightbox";
import { useToasts } from "react-toast-notifications";
import SearchCriteriaConverter from "./Search/search-criteria-converter";
import BenchCardDocument from "./Plant/BenchCardDocument";

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
  const history = useHistory();
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

  const updateSearchCriteria = React.useCallback(
    (sc: SearchCriteria) => {
      let qs = SearchCriteriaConverter.toQuerystring(sc);
      //console.log('search altered',qs);
      if (!history) {
        //console.log('no history')
        //return;
      }
      //console.log(history)
      history.push({
        pathname: "/search",
        search: qs,
      });
      //console.log(sc);
    },
    [history]
  );

  const [isFavoriteByPlantId, updateIsFavoriteByPlantId] =
    useLocalStorage<BoolDict>("isFavoriteByPlantId", {});
  const favoritePlants = sortPlants(
    !searchCriteria.city ? 0 : searchCriteria.city.region
  )(data.plants.filter((p) => !!isFavoriteByPlantId[p.id]));
  const isPlantFavorite = (p: Plant) => !!isFavoriteByPlantId[p.id];

  const { addToast, removeToast } = useToasts();

  const addAllToFavorites = (plants: Plant[]) => {
    let original = Object.assign({},isFavoriteByPlantId);
    let amended = Object.assign(Object.assign({}, original), Object.fromEntries(plants.map(p => [p.id, true])));
    console.log(amended);
    updateIsFavoriteByPlantId(amended);

    let thisToastId = "";
    addToast(
      <div>
        Added {plants.length} favorites
        <button
          className="btn btn-link"
          onClick={() => {
            updateIsFavoriteByPlantId(original);
            removeToast(thisToastId);
          }}
        >
          UNDO
        </button>
      </div>,
      {
        appearance: "info",
        transitionState: "entered",
        autoDismiss: true,
      },
      (toastId) => {
        thisToastId = toastId;
      }
    );
  };

  const clearAllFavorites = () => {
    let clearedDict = Object.fromEntries(favoritePlants.map(p => [p.id, false]));
    let unclearedDict = Object.fromEntries(favoritePlants.map(p => [p.id, true]));
    updateIsFavoriteByPlantId(clearedDict);

    let thisToastId = "";
    addToast(
      <div>
        Cleared favorites
        <button
          className="btn btn-link"
          onClick={() => {
            updateIsFavoriteByPlantId(unclearedDict);
            removeToast(thisToastId);
          }}
        >
          UNDO
        </button>
      </div>,
      {
        appearance: "info",
        transitionState: "entered",
        autoDismiss: true,
      },
      (toastId) => {
        thisToastId = toastId;
      }
    );
  };

  function togglePlantFavorite(p: Plant) {
    let isFavoriteNow = !isFavoriteByPlantId[p.id];
    updateIsFavoriteByPlantId({
      ...isFavoriteByPlantId,
      [p.id]: isFavoriteNow,
    });
    let thisToastId = "";
    addToast(
      <div>
        Plant {isFavoriteNow ? "added to" : "removed from"} favorites
        <button
          className="btn btn-link"
          onClick={() => {
            updateIsFavoriteByPlantId({
              ...isFavoriteByPlantId,
              [p.id]: !isFavoriteNow,
            });
            removeToast(thisToastId);
            //togglePlantFavorite(p);
          }}
        >
          UNDO
        </button>
      </div>,
      {
        appearance: "info",
        transitionState: "entered",
        autoDismiss: true,
      },
      (toastId) => {
        thisToastId = toastId;
      }
    );
  }

  return (
    <>
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
                  activeClassName="active"
                  className="btn btn-outline-light"
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
        <Route exact={true} path="/">
          <Redirect to="/search" />
        </Route>
        <Route
          path="/map"
          render={({ match }) => {
            return (
              <div>
                <Map
                  cities={data.cities}
                  onSelect={(city: City) => {
                    alert(city.name);
                  }}
                />
              </div>
            );
          }}
        />
        <Route
          path="/plant/:plantId"
          exact={true}
          render={({ match }) => {
            const id = parseInt(match.params.plantId);
            let plant = data.plants.filter(
              (p) => p.id === id || p.url_keyword === match.params.plantId
            )[0];
            return !plant ? (
              <div className="container-fluid my-5">
                No plant found by that ID
              </div>
            ) : (
              <div className="container-fluid">
                <SimpleReactLightbox>
                  <PlantDetail
                    {...{
                      plant,
                      photos: data.photos[plant.botanicalName] || [],
                      benchCardTemplates: data.benchCardTemplates,
                      plantTypeNameByCode: data.plantTypeNameByCode,
                      waterUseByCode: data.waterUseByCode,
                      waterUseClassifications: data.waterUseClassifications,
                      region: !!searchCriteria.city
                        ? searchCriteria.city.region
                        : 0,
                      togglePlantFavorite,
                      isPlantFavorite,
                      regions: data.regions,
                    }}
                  />
                </SimpleReactLightbox>
              </div>
            );
          }}
        />
        <Route
          path="/plant/:plantId/benchcard/:bctId"
          render={({ match }) => {
            const id = parseInt(match.params.plantId);
            const bctId = match.params.bctId;
            const bct = data.benchCardTemplates.filter(
              (bct) => bct.id === bctId
            )[0];
            let plant = data.plants.filter(
              (p) => p.id === id || p.url_keyword === match.params.plantId
            )[0];
            return !plant ? (
              <div className="container-fluid my-5">
                No plant found by that ID
              </div>
            ) : !bct ? (
              <div className="container-fluid my-5">
                No Bench Card found by that ID
              </div>
            ) : (
              <>
                {/*
            <pre>{JSON.stringify(plant,null,2)}</pre>
            */}
                <PDFViewer
                  style={{ width: "100vw", height: "90vh" }}
                  showToolbar={false}
                >
                  <BenchCardDocument
                    benchCardTemplate={bct}
                    plant={plant}
                    region={
                      (searchCriteria.city && searchCriteria.city.region) || 1
                    }
                    waterUseByCode={data.waterUseByCode}
                  />
                </PDFViewer>
              </>
            );
          }}
        />
        <Route exact={true} path="/favorites">
          <Favorites
            {...{
              favoritePlants,
              queryString: location.search,
              isPlantFavorite,
              togglePlantFavorite,
              searchCriteria,
              clearAllFavorites,
              data,
            }}
          />
        </Route>
        {/*
      <Route exact="true" path="/search/(types)?/:types?" render={match => 
      */}
        <Route
          exact={true}
          path="/search"
          render={(match) => (
            <Search
              queryString={location.search}
              searchCriteria={searchCriteria}
              isPlantFavorite={isPlantFavorite}
              togglePlantFavorite={togglePlantFavorite}
              setSearchCriteria={updateSearchCriteria}
              searchPerformed={searchWasPerformed(searchCriteria)}
              resetSearchCriteria={resetSearchCriteria}
              addAllToFavorites={addAllToFavorites}
              data={data}
            />
          )}
        />
      </div>
    </>
  );
}

export default App;
