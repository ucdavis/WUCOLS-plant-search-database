import React from "react";
import PlantTypeBadge from "./PlantTypeBadge";
import WaterDropRating from "./WaterDropRating";
import { SRLWrapper } from "simple-react-lightbox";
import PlantFavoriteButton from "./PlantFavoriteButton";
import { PlantDetailQrCode } from "./PlantDetailQrCode";
import { Link } from "react-router-dom";

const PlantDetail = ({
  plant,
  plantTypeNameByCode,
  waterUseByCode,
  region,
  regions,
  benchCardTemplates,
  isPlantFavorite,
  togglePlantFavorite,
}) => {
  if (!plant) {
    return <div>Invalid Plant</div>;
  }
  //let wu = waterUseByCode[plant.waterUseByRegion[region-1]];
  let regionWaterUsePairs = regions.map((r) => [
    r,
    waterUseByCode[plant.waterUseByRegion[r.id - 1]],
  ]);

  const imageSize = "64px";
  let leadPhoto = plant.photos[0];
  let photoUrl = !leadPhoto ? "" : leadPhoto.large.url;

  const webBenchCard = (
    <>
      <div className="float-right h2">
        <PlantFavoriteButton
          {...{ plant, togglePlantFavorite, isPlantFavorite }}
        />
      </div>
      <div className="d-flex flex-row bd-highlight align-items-center mb-4 ">
        {photoUrl && (
          <img
            className="mr-3"
            src={photoUrl}
            style={{ objectFit: "cover", width: imageSize, height: imageSize }}
            alt={plant.botanicalName}
          />
        )}
        <h1 className="m0">
          <em>{plant.botanicalName}</em>
        </h1>
      </div>

      <table className="table table-bordered">
        <tbody>
          <tr>
            <th style={{ width: "25%" }}>Botanical Name</th>
            <td>
              <em>{plant.botanicalName}</em>
            </td>
          </tr>
          <tr>
            <th>Common Name</th>
            <td>{plant.commonName}</td>
          </tr>
          <tr>
            <th>Plant Type(s)</th>
            <td>
              {plant.types.map((t) => (
                <PlantTypeBadge
                  type={t}
                  plantTypeNameByCode={plantTypeNameByCode}
                  key={t}
                />
              ))}
            </td>
          </tr>
        </tbody>
      </table>

      <div className="my-5">
        <h4 className="mb-4">Water Usage by Region</h4>
        <table className="table table-bordered table-sm">
          <tbody>
            {regionWaterUsePairs.map(([r, wu]) => (
              <tr className={r.id === region ? "table-primary" : ""} key={r.id}>
                <td>
                  Region {r.id}: {r.name}
                </td>
                <td style={{ whiteSpace: "nowrap" }}>
                  <WaterDropRating waterUseCode={wu.code} />
                </td>
                <td style={{ whiteSpace: "nowrap" }}>{wu.name}</td>
                <td style={{ whiteSpace: "nowrap" }}>
                  {wu.percentageET0 === "N/A" ? (
                    "N/A"
                  ) : (
                    <>
                      {wu.percentageET0}% ET<sub>0</sub>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!!plant.culturalInformation && (
        <div>
          <h4 className="mb-4">Cultural Information</h4>
          <div
            dangerouslySetInnerHTML={{ __html: plant.culturalInformation }}
          />
        </div>
      )}

      <div className="row mt-4">
        {!!plant.photos.length && (
          <div className="col-sm-12">
            <h4 className="mb-4">Photos ({plant.photos.length})</h4>
            <SRLWrapper key="plant gallery">
              <div className="row row-cols-1 row-cols-md-3 g-4">
                {plant.photos.map((p, i) => (
                  <div className="col" key={i}>
                    <div className="card mb-3" key={i}>
                      <a href={p.full.url}>
                        <img
                          src={p.large.url}
                          className="card-img-top"
                          alt={p.caption}
                          style={{
                            height: "10em",
                            objectFit: "cover",
                          }}
                        />
                      </a>
                      <div className="card-body text-center">
                        <p className="card-text">{p.caption}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </SRLWrapper>
          </div>
        )}
      </div>
    </>
  );

  return (
    <>
      <div className="row">
        <div className="col-md-8 col-xl-9 ml-sm-auto pt-3 pb-5 px-5">
          {webBenchCard}
        </div>
        <nav
          className="col-md-4 col-xl-3 bg-light"
          style={{ borderLeft: "1px solid #ddd" }}
        >
          <div className="p-3">
            <div className="d-flex flex-column">
              {benchCardTemplates.map((bct) => (
                <div className="card mb-3 text-center" key={bct.id}>
                  <div className="card-body d-flex flex-column justify-content-between">
                    <h4>{bct.name} Bench Card</h4>
                    <Link
                      key={bct.id}
                      to={`/plant/${plant.id}/benchcard/${bct.id}`}
                      className="mt-3 btn btn-success"
                      target="_blank"
                    >
                      Download
                    </Link>
                  </div>
                </div>
              ))}
              <div className="card mr-3 text-center">
                <div className="card-body">
                  <h4>QR Code</h4>
                  <PlantDetailQrCode
                    plant={plant}
                    style={{ width: "auto", maxWidth: "150px" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </nav>
      </div>
    </>
  );
};

export default PlantDetail;
