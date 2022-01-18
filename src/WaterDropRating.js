import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTint } from "@fortawesome/free-solid-svg-icons";

const dropRatingByWaterUseCode = (() => {
  const DropIcon = ({ filled }) => (
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
  return {
    '?': <>{d}{d}{d}{d}</>,
    'N': <>{d}{d}{d}{d}</>,
    'VL': <>{D}{d}{d}{d}</>,
    'LO': <>{D}{D}{d}{d}</>,
    'M':  <>{D}{D}{D}{d}</>,
    'H':  <>{D}{D}{D}{D}</>
  };
})();

const WaterDropRating = ({ waterUseCode }) =>
  dropRatingByWaterUseCode[waterUseCode] || <>N/A</>;

export default WaterDropRating;
