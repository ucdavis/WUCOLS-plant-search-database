import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";

const PlantFavoriteButton = ({
  plant,
  togglePlantFavorite,
  isPlantFavorite,
}) => {
  const FavoriteIcon = () => <FontAwesomeIcon icon={faStar} />;
  const dropShadowCss = "drop-shadow( 0px 1px 1px rgba(0, 0, 0, .3))";
  return (
    <button
      title={
        isPlantFavorite(plant)
          ? "This plant is in your favorites.  Click to remove it."
          : "Click to add this plant to your favorites."
      }
      className={
        "btn " + (isPlantFavorite(plant) ? " btn-warning" : "btn-light")
      }
      onClick={() => togglePlantFavorite(plant)}
    >
      {isPlantFavorite(plant) ? (
        <span
          style={{
            color: "hsl(60deg 100% 45%)",
            WebkitFilter: dropShadowCss,
            filter: dropShadowCss,
          }}
        >
          <FavoriteIcon />
        </span>
      ) : (
        <span style={{ opacity: 0.2 }}>
          <FavoriteIcon />
        </span>
      )}
    </button>
  );
};

export default PlantFavoriteButton;
