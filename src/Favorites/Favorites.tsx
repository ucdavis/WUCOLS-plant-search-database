import React from "react";
import PlantTable from "../Plant/PlantTable";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faQrcode,
  faFileExcel,
  faIdCard,
} from "@fortawesome/free-solid-svg-icons";
import { Data, Plant, SearchCriteria } from "../types";
import DownloadMenu from '../Download/DownloadMenu';
import { getPlantPaginationProps, PlantPagination } from "../Plant/PlantPagination";

interface Props {
  queryString: string;
  favoritePlants: Plant[];
  data: Data;
  isPlantFavorite: (plant: Plant) => boolean;
  togglePlantFavorite: (plant: Plant) => void;
  clearAllFavorites: () => void;
  searchCriteria: SearchCriteria;
}

const Favorites = ({
  queryString,
  favoritePlants,
  data,
  isPlantFavorite,
  togglePlantFavorite,
  clearAllFavorites,
  searchCriteria,
}: Props) => {
  const [currentPageNumber, setCurrentPageNumber] = React.useState(0);
  const plantPaginationProps = getPlantPaginationProps(
    50,
    favoritePlants.length,
    currentPageNumber, 
    setCurrentPageNumber);

  const actualPagination = PlantPagination({...plantPaginationProps});
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
                {!!favoritePlants.length && 
                  <DownloadMenu {...{searchCriteria,data, plants:favoritePlants}} />
                }
              </div>
            </nav>
            <div className="col-sm-8 col-lg-9 col-xl-10 ml-sm-auto">
              <div className="my-3">
                {favoritePlants.length === 0 ? (
                  "You don't have any favorites yet."
                ) : (
                  <div className="clearfix">
                    You have <strong>{favoritePlants.length}</strong>
                    {' '}favorite{favoritePlants.length > 1 ? 's' : ''} so far.
                    <button className="btn btn-sm btn-danger float-right" onClick={clearAllFavorites}>Clear All Favorites</button>
                  </div>
                )}
              </div>
              {!searchCriteria.city ? (
                <div>Select a city to view your favorites</div>
              ) : (
                <>
                {actualPagination}
                <PlantTable
                  queryString={queryString}
                  showAvailableMedia={true}
                  isPlantFavorite={isPlantFavorite}
                  togglePlantFavorite={togglePlantFavorite}
                  plants={plantPaginationProps.getCurrentItems(favoritePlants)}
                  photosByPlantName={data.photos}
                  plantTypeNameByCode={data.plantTypeNameByCode}
                  region={searchCriteria.city.region}
                  waterUseByCode={data.waterUseByCode}
                />
                {actualPagination}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Favorites;
