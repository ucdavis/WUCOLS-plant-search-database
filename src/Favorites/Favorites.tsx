import React from "react";
import PlantTable from "../Plant/PlantTable";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faQrcode,
  faFileExcel,
  faIdCard,
} from "@fortawesome/free-solid-svg-icons";
import { Data, DownloadAction, Plant, SearchCriteria } from "../types";

interface Props {
  queryString: string;
  favoritePlants: Plant[];
  getDownloadActions: (
    data: Data,
    searchCriteria: SearchCriteria,
    favoritePlants: Plant[]
  ) => DownloadAction[];
  data: Data;
  isPlantFavorite: (plant: Plant) => boolean;
  togglePlantFavorite: (plant: Plant) => void;
  searchCriteria: SearchCriteria;
}

const Favorites = ({
  queryString,
  favoritePlants,
  getDownloadActions,
  data,
  isPlantFavorite,
  togglePlantFavorite,
  searchCriteria,
}: Props) => {
  const downloadButtons = (
    className: string,
    searchCriteria: SearchCriteria,
    favoritePlants: Plant[]
  ) => {
    return getDownloadActions(data, searchCriteria, favoritePlants).map((a) => (
      <button className={className} onClick={a.method}>
        {a.label}
      </button>
    ));
  };
  return (
    <>
      <div className="container-fluid">
        {!favoritePlants.length ? (
          <div className="py-5">
            <div className="text-center mb-5">
              <div className="h3">You do not have any favorite species yet</div>
              <p>
                After you have added some favorites, you can download them in
                various formats.
              </p>
            </div>
            <div className="d-flex justify-content-around">
              {[
                {
                  icon: faFileExcel,
                  label: "Spreadsheet",
                },
                {
                  icon: faQrcode,
                  label: "QR Codes",
                },
                {
                  icon: faIdCard,
                  label: "Bench Cards",
                },
              ].map((f, i) => (
                <div className="" key={i}>
                  <div className="card">
                    <div className="card-body text-center">
                      <FontAwesomeIcon icon={f.icon} className="mt-2 h1" />
                      <div className="h5">{f.label}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="row">
            <nav className="col-sm-4 col-lg-3 col-xl-2 sidebar bg-light">
              <div className="sidebar-sticky p-3">
                {!!favoritePlants.length && (
                  <div className="mb-3 d-flex flex-column justify-content-around">
                    <div className="mb-3">
                      {downloadButtons(
                        "btn btn-primary btn-block",
                        searchCriteria,
                        favoritePlants
                      ).map((c, i) => (
                        <div className="my-2" key={i}>
                          {c}
                        </div>
                      ))}
                    </div>
                    <p>
                      QR Codes and Bench Cards can be downloaded individually
                      for each plant from that plant&apos;s detail screen.
                    </p>
                  </div>
                )}
              </div>
            </nav>
            <div className="col-sm-8 col-lg-9 col-xl-10 ml-sm-auto">
              <div className="my-3">
                {favoritePlants.length === 0 ? (
                  "You don't have any favorites yet."
                ) : favoritePlants.length === 1 ? (
                  "You have 1 favorite so far."
                ) : (
                  <div>
                    You have <strong>{favoritePlants.length}</strong> favorites
                    so far.
                  </div>
                )}
              </div>
              {!searchCriteria.city ? (
                <div>Select a city to view your favorites</div>
              ) : (
                <PlantTable
                  queryString={queryString}
                  showAvailableMedia={true}
                  isPlantFavorite={isPlantFavorite}
                  togglePlantFavorite={togglePlantFavorite}
                  plants={favoritePlants}
                  photosByPlantName={data.photos}
                  plantTypeNameByCode={data.plantTypeNameByCode}
                  region={searchCriteria.city.region}
                  waterUseByCode={data.waterUseByCode}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Favorites;
