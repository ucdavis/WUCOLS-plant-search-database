import React from "react";
import { Plant } from "../types";

const googleQrCodeUrl = (destination_url: string) =>
  `https://chart.googleapis.com/chart?chs=500x500&cht=qr&choe=UTF-8&chl=${encodeURIComponent(
    destination_url
  )}`;

const plantDetailUrlFromId = (id: number) =>
  /* example expected patterns:
    - https://some.website-of-yours.app/plants/:id/detail 
    - https://some.website-of-yours.app/plants?id=:id&utm_source=qr_code
  */
  (import.meta.env.VITE_PLANT_DETAIL_URL_PATTERN || "") !== ""
    ? new URL(
        import.meta.env.VITE_PLANT_DETAIL_URL_PATTERN.replace(
          ":id",
          id.toString()
        )
      ).toString()
    : "";

export const plantDetailQrCodeFromId = (id: number) => {
  let url = plantDetailUrlFromId(id);
  return {
    destination_url: url,
    image_url: googleQrCodeUrl(url),
  };
};

interface Props {
  plant: Plant;
  style?: React.CSSProperties;
}

export const PlantDetailQrCode = ({ plant, style }: Props) => {
  let { destination_url, image_url } = plantDetailQrCodeFromId(plant.id);
  return (
    <a href={destination_url} target="_blank" rel="noreferrer">
      <img
        src={image_url}
        alt={"QR Code for " + plant.botanicalName}
        className="img-responsive"
        style={{ width: "64px", ...(style || {}) }}
      />
    </a>
  );
};
