import React from "react";
import PlantTypeBadge from "./PlantTypeBadge";
import WaterDropRating from "./WaterDropRating";
import PlantFavoriteButton from "./PlantFavoriteButton";
import { PlantDetailQrCode } from "./PlantDetailQrCode";
import { Link } from "react-router-dom";
import { Photo, Plant, WaterUseClassification } from "./types";

interface Props {
  queryString: string;
  showAvailableMedia: boolean;
  plants: Plant[];
  photosByPlantName: { [key: string]: Photo };
  plantTypeNameByCode: { [key: string]: string };
  waterUseByCode: { [key: string]: WaterUseClassification };
  region: number;
  isPlantFavorite: (plant: Plant) => boolean;
  togglePlantFavorite: (plant: Plant) => void;
}

const PlantTable = ({
  queryString,
  showAvailableMedia,
  plants,
  photosByPlantName,
  plantTypeNameByCode,
  waterUseByCode,
  region,
  isPlantFavorite,
  togglePlantFavorite,
}: Props) => {
  return (
    <table className="table table-sm ">
      <thead>
        <tr>
          <th rowSpan={2}>Photo</th>
          <th rowSpan={2}>Name</th>
          {showAvailableMedia && (
            <>
              <th rowSpan={2}>QR Code</th>
            </>
          )}
          <th rowSpan={2}>Water Use</th>
          <th rowSpan={2}>Type(s)</th>
          <th rowSpan={2}>Favorite</th>
        </tr>
      </thead>
      <tbody>
        {plants.map((p) => {
          const imageSize = "64px";
          let wu = waterUseByCode[p.waterUseByRegion[region - 1]];
          let photoUrl = !photosByPlantName[p.botanicalName]
            ? "https://via.placeholder.com/200"
            : photosByPlantName[p.botanicalName].small.url;
          return (
            <tr key={p.id}>
              <td style={{ width: imageSize }}>
                <img
                  className="card-img mr-2"
                  style={{
                    width: imageSize,
                    height: imageSize,
                    background: `url(${photoUrl})`,
                    backgroundSize: "cover",
                  }}
                  src={photoUrl}
                  alt={p.botanicalName}
                />
              </td>
              <td>
                <Link to={`/plant/${p.id}${queryString}`}>
                  <h6 className="mt-0 mb-1">
                    <em>{p.botanicalName}</em>
                  </h6>
                </Link>
                <div>{p.commonName}</div>
              </td>
              {showAvailableMedia && (
                <td>
                  <PlantDetailQrCode plant={p} />
                </td>
              )}
              <td>
                <WaterDropRating waterUseCode={wu.code} />
                <small className="ml-2">{wu.name}</small>
                <br />
                <small>
                  {wu.percentageET0}% ET<sub>0</sub>
                  <br />
                  Plant Factor: {wu.plantFactor}
                </small>
              </td>
              <td>
                {p.types.map((t) => (
                  <PlantTypeBadge
                    plantTypeNameByCode={plantTypeNameByCode}
                    type={t}
                    key={t}
                  />
                ))}
              </td>
              <td>
                <PlantFavoriteButton
                  {...{ plant: p, togglePlantFavorite, isPlantFavorite }}
                />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default PlantTable;
