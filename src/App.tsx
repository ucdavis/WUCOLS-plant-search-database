import React from "react";
import ReactDOM from "react-dom";
import "./App.css";
import Map from "./Map";
//import {useGeolocation} from '../src/useGeolocation';
import useLocalStorage from "./useLocalStorage";
import sortPlants from "./sort-plants";
import Search from "./Search";
import PlantDetail from "./PlantDetail";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faFileExcel,
  faStar,
  faQrcode,
  faIdCard,
} from "@fortawesome/free-solid-svg-icons";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { PDFViewer, pdf } from "@react-pdf/renderer";

import Favorites from "./favorites";

import { DropdownButton, Dropdown } from "react-bootstrap";

import ReactExport, { ExcelCellData, ExcelSheetData } from "react-export-excel";
import {
  //BrowserRouter as Router,
  useLocation,
  useHistory,
  Route,
  NavLink,
  Redirect,
} from "react-router-dom";
//import groupBy from './groupBy';
import SimpleReactLightbox from "simple-react-lightbox";
import { useToasts } from "react-toast-notifications";
import SearchCriteriaConverter from "./SearchCriteriaConverter";
import BenchCardDocument from "./BenchCardDocument";

import { BoolDict, City, Data, Plant, SearchCriteria } from "./types";
import { plantDetailQrCodeFromId } from "./PlantDetailQrCode";

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

  const favoriteAsSpreadsheets = (
    data: Data,
    searchCriteria: SearchCriteria,
    favoritePlants: Plant[]
  ): [string[][], ExcelSheetData[]] => {
    if (!searchCriteria.city) {
      return [[], []];
    }
    let cityRegionIx = searchCriteria.city.region - 1;
    const csv = [
      [
        "Type(s)",
        "Botanical Name",
        "Common Name",
        "Water Use",
        "Percentage of ET0",
      ],
      ...favoritePlants.map((p) => [
        p.types.map((t) => data.plantTypeNameByCode[t]).join(", "),
        p.botanicalName,
        p.commonName,
        data.waterUseByCode[p.waterUseByRegion[cityRegionIx]].name,
        data.waterUseByCode[p.waterUseByRegion[cityRegionIx]].percentageET0 +
          "%",
      ]),
    ];

    const xl = [
      {
        columns: [
          "Type(s)",
          "Botanical Name",
          "Common Name",
          "Water Use",
          "Percentage of ET0",
        ],
        data: favoritePlants.map(
          (p) =>
            [
              p.types.map((t) => data.plantTypeNameByCode[t]).join(", "),
              p.botanicalName,
              p.commonName,
              data.waterUseByCode[p.waterUseByRegion[cityRegionIx]].name,
              data.waterUseByCode[p.waterUseByRegion[cityRegionIx]]
                .percentageET0 + "%",
            ] as ExcelCellData[]
        ),
      } as ExcelSheetData,
    ];

    return [csv, xl];
  };

  const downloadActions = (
    data: Data,
    searchCriteria: SearchCriteria,
    favoritePlants: Plant[]
  ) => {
    const ExcelFile = ReactExport.ExcelFile;
    const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
    let [, excelData] = favoriteAsSpreadsheets(
      data,
      searchCriteria,
      favoritePlants
    );
    const sideRender = (el: any) => {
      ReactDOM.render(el, document.getElementById("download-outlet"));
    };
    return [
      /*
      {
        method: () => {
          sideRender(
            <CSVDownload
              target="_blank"
              data={csvData}
              filename={`WUCOLS_${searchCriteria.city.name}.csv`}
            />
          );
        },
        label: 
          <>
            <FontAwesomeIcon icon={faFileExcel} className="mr-2"/>
            Download in CSV format
          </>
      }
      ,
      */
      {
        method: () => {
          Promise.all(
            favoritePlants.map((p: Plant) =>
              fetch(plantDetailQrCodeFromId(p.id).image_url)
                .then((r) => r.blob())
                .then((b) => [p, b] as [Plant, Blob])
            )
          ).then((plantBlobPairs) => {
            var zip = new JSZip();
            for (let [p, blob] of plantBlobPairs) {
              zip.file(
                p.commonName + ".png",
                blob as unknown as null,
                {
                  blob: true,
                } as unknown as JSZip.JSZipFileOptions & { dir: true }
              );
            }
            zip.generateAsync({ type: "blob" }).then(function (content) {
              saveAs(content, "qr-codes.zip");
            });
          });
        },
        label: (
          <>
            <FontAwesomeIcon icon={faQrcode} className="mr-2" />
            Download QR codes
          </>
        ),
      },
      ...data.benchCardTemplates.map((bct) => ({
        method: () => {
          Promise.all(
            favoritePlants.map((p: Plant) =>
              pdf(
                <BenchCardDocument
                  plant={p}
                  region={searchCriteria.city.region}
                  waterUseByCode={data.waterUseByCode}
                />
              )
                .toBlob()
                .then((b) => [p, b] as [Plant, Blob])
            )
          ).then((plantBlobPairs) => {
            var zip = new JSZip();
            for (let [p, blob] of plantBlobPairs) {
              zip.file(
                p.commonName + ".pdf",
                blob as unknown as null,
                {
                  blob: true,
                } as unknown as JSZip.JSZipFileOptions & { dir: true }
              );
            }
            zip.generateAsync({ type: "blob" }).then(function (content) {
              saveAs(content, `bench-cards-${bct.name}.zip`);
            });
          });
        },
        label: (
          <>
            <FontAwesomeIcon icon={faIdCard} className="mr-2" />
            Download Bench Cards ({bct.name})
          </>
        ),
      })),
      {
        method: () => {
          sideRender(
            <ExcelFile
              filename={`WUCOLS_${searchCriteria.city.name}`}
              hideElement={true}
            >
              <ExcelSheet
                dataSet={excelData}
                name={`WUCOLS_${searchCriteria.city.name}`}
              />
            </ExcelFile>
          );
        },
        label: (
          <>
            <FontAwesomeIcon icon={faFileExcel} className="mr-2" />
            Download in Excel format
          </>
        ),
      },
    ];
  };

  return (
    <div className="App">
      <nav className="navbar navbar-dark bg-dark sticky-top navbar-light bg-light d-flex justify-content-between">
        <a className="navbar-brand" href="/">
          WUCOLS Plant Search Database
        </a>

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

        {!searchCriteria.city || true ? (
          <div className="text-light">
            {/*Select a city to enable downloads*/}
          </div>
        ) : (
          <DropdownButton
            title="Download"
            variant="outline-light"
            disabled={!searchCriteria.city}
          >
            {downloadActions(data, searchCriteria, favoritePlants).map(
              (a, i) => (
                <Dropdown.Item onClick={a.method} key={i}>
                  {a.label}
                </Dropdown.Item>
              )
            )}
          </DropdownButton>
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
            downloadActions,
            isPlantFavorite,
            togglePlantFavorite,
            searchCriteria,
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
            data={data}
          />
        )}
      />
    </div>
  );
}

export default App;
