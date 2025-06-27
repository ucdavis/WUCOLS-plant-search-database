import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { Plant } from "../types";

interface Props {
  plant: Plant;
  togglePlantFavorite: (plant: Plant) => void;
  isPlantFavorite: (plant: Plant) => boolean;
}

const PlantFavoriteButton = ({
  plant,
  togglePlantFavorite,
  isPlantFavorite,
}: Props) => {
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
        <span>
          <FavoriteIcon />
        </span>
      )}
    </button>
  );
};

export default PlantFavoriteButton;
