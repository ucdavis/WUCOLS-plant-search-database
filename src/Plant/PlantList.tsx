import PlantTypeBadge from "./PlantTypeBadge";
import WaterDropRating from "./WaterDropRating";
import PlantFavoriteButton from "./PlantFavoriteButton";
import { Link } from "react-router-dom";
import { Photo, Plant, WaterUseClassification } from "../types";

interface Props {
  className: string;
  plants: Plant[];
  photosByPlantName: { [key: string]: Photo };
  plantTypeNameByCode: { [key: string]: string };
  waterUseByCode: { [key: string]: WaterUseClassification };
  region: number;
  isPlantFavorite: (plant: Plant) => boolean;
  togglePlantFavorite: (plant: Plant) => void;
}

const PlantList = ({
  className,
  plants,
  photosByPlantName,
  plantTypeNameByCode,
  waterUseByCode,
  region,
  isPlantFavorite,
  togglePlantFavorite,
}: Props) => {
  return (
    <div className="row no-gutters">
      {plants.map((p) => {
        const imageSize = "150px";
        let wu = waterUseByCode[p.waterUseByRegion[region - 1]];
        let photoUrl = !photosByPlantName[p.botanicalName]
          ? "https://via.placeholder.com/200"
          : photosByPlantName[p.botanicalName].small.url;
        return (
          <div className={className} key={p.id}>
            <div className="card mr-2 mb-2">
              <div className="d-flex">
                <div className="d-flex-shrink-0">
                  <div style={{ position: "relative" }}>
                    <div
                      style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        color: "unset",
                      }}
                    >
                      <PlantFavoriteButton
                        {...{ plant: p, togglePlantFavorite, isPlantFavorite }}
                      />
                    </div>
                    <img
                      className="card-img"
                      style={{
                        width: imageSize,
                        height: imageSize,
                        background: `url(${photoUrl})`,
                        backgroundSize: "cover",
                      }}
                      src={photoUrl}
                      alt={p.botanicalName}
                    />
                  </div>
                </div>
                <div className="d-flex-grow-1 ml-3 flex-fill">
                  <div className="card-body">
                    <div className="float-right text-right ml-3">
                      <WaterDropRating waterUseCode={wu.code} />
                      <br />
                      <small>{wu.name}</small>
                      <br />
                      <small>
                        {wu.percentageET0}% ET<sub>0</sub>
                      </small>

                      {/*
                      <div>
                        <input type="checkbox" checked={isPlantFavorite(p)} onChange={() => togglePlantFavorite(p)}/>
                      </div>
                      */}
                    </div>
                    <Link to={`/plant/${p.id}`}>
                      <h6 className="mt-0 mb-1">
                        <em>{p.botanicalName}</em>
                      </h6>
                    </Link>
                    <div>{p.commonName}</div>
                    <div>
                      {p.types.map((t) => (
                        <PlantTypeBadge
                          plantTypeNameByCode={plantTypeNameByCode}
                          type={t}
                          key={t}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PlantList;
