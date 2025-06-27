import { TypeCode } from "../types";

interface Props {
  type: TypeCode;
  plantTypeNameByCode: { [key: string]: string };
}

const PlantTypeBadge = ({ type, plantTypeNameByCode }: Props) => (
  <span>
    <span className="badge badge-plantType">
      {/*
      🌻💮🌺✽✾✿🎕
      🌼🌸🌹❁❃❋🌴𐇲
      🌷❀⚘𐇵🍀☘🌱🍁
      */}
      {type === "A" && (
        <span role="img" aria-label="flower">
          🌸{" "}
        </span>
      )}
      {plantTypeNameByCode[type]}
    </span>{" "}
  </span>
);

export default PlantTypeBadge;
