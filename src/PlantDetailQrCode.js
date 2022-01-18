import React from "react";

const googleQrCodeUrl = (destination_url) =>
  `https://chart.googleapis.com/chart?chs=500x500&cht=qr&choe=UTF-8&chl=${encodeURIComponent(
    destination_url
  )}`;

const plantDetailUrlFromId = (id) =>
  /* example expected patterns:
    - https://some.website-of-yours.app/plants/:id/detail 
    - https://some.website-of-yours.app/plants?id=:id&utm_source=qr_code
  */
  (process.env.REACT_APP_PLANT_DETAIL_URL_PATTERN || "").replace(":id", id);

export const plantDetailQrCodeFromId = (id) => {
  let url = plantDetailUrlFromId(id);
  return {
    destination_url: url,
    image_url: googleQrCodeUrl(url),
  };
};

export const PlantDetailQrCode = ({ plant, style }) => {
  let { destination_url, image_url } = plantDetailQrCodeFromId(plant.id);
  return (
    <a href={destination_url} target="_blank" rel="noreferrer">
      <img
        src={image_url}
        alt={"QR Code for " + plant.botanicalName}
        className="img-responsive"
        style={Object.assign({ width: "64px" }, style || {})}
      />
    </a>
  );
};
