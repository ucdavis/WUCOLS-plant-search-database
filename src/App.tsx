import React from "react";
import ReactDOM from "react-dom";
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
  faFileExcel,
  faStar,
  faQrcode,
  faIdCard,
} from "@fortawesome/free-solid-svg-icons";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { PDFViewer, pdf } from "@react-pdf/renderer";

import Favorites from "./Favorites/Favorites";

import {
  Button,
  Modal,
  Col,
  Container,
  Row,
  ProgressBar,
} from "react-bootstrap";

import ReactExport, { ExcelCellData, ExcelSheetData } from "react-export-excel";
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
  BenchCardTemplate,
  BoolDict,
  City,
  Data,
  DownloadAction,
  Plant,
  SearchCriteria,
} from "./types";
import { plantDetailQrCodeFromId } from "./Plant/PlantDetailQrCode";
import DownloadActionList from './Download/DownloadActionList';

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

  const zipCancelled = React.useRef(false);
  const [showZipModal, setShowZipModal] = React.useState(false);
  const [zipCurrent, setZipCurrent] = React.useState(0);
  const [zipTotal, setZipTotal] = React.useState(0);
  const [currentBct, setCurrentBct] = React.useState<BenchCardTemplate | null>(
    null
  );

  React.useEffect(() => {
    if (showZipModal && currentBct && !zipCancelled.current) {
      setZipTotal(favoritePlants.length);
      setZipCurrent(0);
      const cb = async () => {
        try {
          const plantBlobPairs = await Promise.all(
            favoritePlants.map(async (p: Plant) => {
              let b: any;
              try {
                if (zipCancelled.current) {
                  throw new Error("Download cancelled");
                }
                b = await pdf(
                  <BenchCardDocument
                    benchCardTemplate={currentBct}
                    plant={p}
                    region={searchCriteria.city.region}
                    waterUseByCode={data.waterUseByCode}
                  />
                ).toBlob();
                let current = 0;
                setZipCurrent((i) => {
                  current = i === 0 ? 1 : i + 1;
                  return current;
                });
                console.log(
                  `generated bench card ${current} of ${favoritePlants.length}`
                );
              } catch (e: any) {
                if (e.message === "Download cancelled") {
                  console.log(e.message);
                } else {
                  console.error(e);
                }
              }
              return [p, b] as [Plant, Blob];
            })
          );
          if (zipCancelled.current) {
            throw new Error("Download cancelled");
          }
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
          await zip.generateAsync({ type: "blob" }).then(function (content) {
            saveAs(content, `bench-cards-${currentBct.name}.zip`);
          });
        } catch (e: any) {
          if (e.message === "Download cancelled") {
            console.log(e.message);
          } else {
            console.error(e);
          }
        } finally {
          setShowZipModal(false);
          setZipCurrent(0);
          setZipTotal(0);
          setCurrentBct(null);
          zipCancelled.current = false;
        }
      };
      cb();
    }
  }, [showZipModal, setShowZipModal, currentBct]); // eslint-disable-line react-hooks/exhaustive-deps

  const plantsAsExcelSheet = (
    data: Data,
    plants: Plant[],
    regionNumbers: number[]
  ): ExcelSheetData[] => 
  [
    {
      columns: [
        "Type(s)",
        "Botanical Name",
        "Common Name",
        ...regionNumbers.flatMap(r => 
          [
            `Region ${r} Water Use`,
            `Region ${r} ET0`,
            `Region ${r} Plant Factor`
          ])
      ],
      data: plants.map(
        (p) =>
          [
            p.types.map((t) => data.plantTypeNameByCode[t]).join(", "),
            p.botanicalName,
            p.commonName,
            ...regionNumbers.flatMap(r => 
              [
                data.waterUseByCode[p.waterUseByRegion[r-1]].name,
                data.waterUseByCode[p.waterUseByRegion[r-1]].percentageET0 + "%",
                data.waterUseByCode[p.waterUseByRegion[r-1]].plantFactor,
              ])
          ] as ExcelCellData[]
      ),
    } as ExcelSheetData
  ];

  const getDownloadActions = (
    data: Data,
    searchCriteria: SearchCriteria,
    favoritePlants: Plant[]
  ): DownloadAction[] => {
    const ExcelFile = ReactExport.ExcelFile;
    const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
    const sideRender = (content: any) => {
      let container = document.getElementById("download-outlet");
      ReactDOM.render(<></>, container, () => {
        /* IMPORTANT!  We clear the dom first, in order to force re-render.
        ** Without this, the user can only download an excel document ONCE until they reload the page.  */
        ReactDOM.render(content, container);
      });
    };
    return [
      {
        include: !!searchCriteria.city,
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
        include: !!searchCriteria.city,
        method: () => {
          if (!zipCancelled.current) {
            setCurrentBct(bct);
            setShowZipModal(true);
          }
        },
        label: (
          <>
            <FontAwesomeIcon icon={faIdCard} className="mr-2" />
            Download Bench Cards ({bct.name})
          </>
        ),
      })),
      {
        include: !!searchCriteria.city,
        method: () => {
          let excelData = plantsAsExcelSheet(
            data,
            favoritePlants,
            [searchCriteria.city.region]
          );
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
      {
        include: !searchCriteria.city,
        method: () => {
          console.log('preparing Excel...');
          let excelData = plantsAsExcelSheet(
            data,
            data.plants,
            [1,2,3,4,5,6]
          );
          console.log('rendering...');
          sideRender(
            <ExcelFile
              filename={`WUCOLS_all_regions`}
              hideElement={true}
            >
              <ExcelSheet
                dataSet={excelData}
                name={`WUCOLS_all_regions`}
              />
            </ExcelFile>
          );
          console.log('rendered');
        },
        label: (
          <>
            <FontAwesomeIcon icon={faFileExcel} className="mr-2" />
            Download WUCOLS plants for all regions
          </>
        ),
      }
    ].filter(da => da.include);
  };

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
              getDownloadActions: getDownloadActions,
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
              downloadActions={getDownloadActions(data, searchCriteria, favoritePlants)}
              resetSearchCriteria={resetSearchCriteria}
              addAllToFavorites={addAllToFavorites}
              data={data}
            />
          )}
        />
        <Modal
          show={showZipModal}
          onHide={() => {
            zipCancelled.current = true;
            setShowZipModal(false);
          }}
        >
          <Modal.Header closeButton>
            <Modal.Title>Generating Zip file</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Container fluid>
              <Row>
                <Col>Please wait. It can take a few seconds per bech card.</Col>
              </Row>
              <Row>
                <Col>
                  <ProgressBar
                    now={Math.round((zipCurrent / zipTotal) * 100)}
                    label={`${zipCurrent} of ${zipTotal}`}
                  />
                </Col>
              </Row>
            </Container>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="primary"
              onClick={() => {
                zipCancelled.current = true;
                setShowZipModal(false);
              }}
            >
              Cancel
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </>
  );
}

export default App;
