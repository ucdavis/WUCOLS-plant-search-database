import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTint } from "@fortawesome/free-solid-svg-icons";
import { WaterUseCode } from "../types";

interface Props {
  waterUseCode: WaterUseCode;
}

const WaterDropRating = ({ waterUseCode }: Props) => {
  interface DropProps {
    filled?: boolean;
  }

  const DropIcon = ({ filled }: DropProps) => (
    <span
      style={{
        opacity: filled ? 1 : 0.3,
        color: filled ? "#007bff" : "grey",
        padding: "0 2px",
      }}
    >
      <FontAwesomeIcon icon={faTint} />
    </span>
  );

  let d = <DropIcon />;
  let D = <DropIcon filled={true} />;
  //let d = <span role="img" aria-label="empty-water-drop" style={{opacity:0.3}}>💧</span>;
  //let D = <span role="img" aria-label="full-water-drop">💧</span>;
  switch (waterUseCode) {
    case "?":
      return (
        <>
          {d}
          {d}
          {d}
          {d}
        </>
      );
    case "N":
      return (
        <>
          {d}
          {d}
          {d}
          {d}
        </>
      );
    case "VL":
      return (
        <>
          {D}
          {d}
          {d}
          {d}
        </>
      );
    case "LO":
      return (
        <>
          {D}
          {D}
          {d}
          {d}
        </>
      );
    case "M":
      return (
        <>
          {D}
          {D}
          {D}
          {d}
        </>
      );
    case "H":
      return (
        <>
          {D}
          {D}
          {D}
          {D}
        </>
      );
    default:
      return <>N/A</>;
  }
};

export default WaterDropRating;
