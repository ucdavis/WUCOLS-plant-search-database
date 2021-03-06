import React from "react";

import { TypeCode } from "../types";

interface Props {
  type: TypeCode;
  plantTypeNameByCode: { [key: string]: string };
}

const PlantTypeBadge = ({ type, plantTypeNameByCode }: Props) => (
  <span>
    <span className="badge badge-plantType">
      {/*
      ๐ป๐ฎ๐บโฝโพโฟ๐
      ๐ผ๐ธ๐นโโโ๐ด๐ฒ
      ๐ทโโ๐ต๐โ๐ฑ๐
      */}
      {type === "A" && (
        <span role="img" aria-label="flower">
          ๐ธ{" "}
        </span>
      )}
      {plantTypeNameByCode[type]}
    </span>{" "}
  </span>
);

export default PlantTypeBadge;
