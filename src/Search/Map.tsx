import React from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { City } from "../types";

declare global {
  interface Window {
    map: google.maps.Map;
    extraControls: HTMLDivElement;
    currentPosition: google.maps.LatLng;
  }
}

const containerStyle = {
  width: "100%",
  height: "70vh",
};

interface CityMarkerProps {
  city: City;
  onClick: (city: City) => void;
}

const CityMarker = ({ city, onClick }: CityMarkerProps) => {
  const markerRef = React.useRef<Marker | null>(null);
  let iw = new window.google.maps.InfoWindow({
    content: `<div>${city.name}</div>`,
  });
  const setNameVisible = (v: boolean) => {
    if (v) {
      let marker = markerRef.current?.marker as any;
      let map = marker?.map;
      iw.open({
        anchor: marker,
        map,
        shouldFocus: false,
      });
    } else {
      iw.close();
    }
  };
  return (
    <>
      <Marker
        position={city.position}
        ref={(ref) => (markerRef.current = ref)}
        onClick={() => {
          onClick(city);
          iw.close();
        }}
        onMouseOver={() => {
          setNameVisible(true);
        }}
        onMouseOut={() => {
          setNameVisible(false);
        }}
      />
    </>
  );
};

const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
const libraries: ["geometry"] = ["geometry"];

interface MyComponentProps {
  cities: City[];
  onSelect: (city: City) => void;
}

function MyComponent({ cities, onSelect }: MyComponentProps) {
  interface CityMeasurement {
    city: City;
    cityPosition: google.maps.LatLng;
    distance: number;
  }

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    libraries,
    googleMapsApiKey: apiKey,
  });

  const [, setMap] = React.useState<google.maps.Map | null>(null);

  const fitPositions = (
    map: google.maps.Map,
    positions: google.maps.LatLng[]
  ) => {
    const bounds = new window.google.maps.LatLngBounds();
    positions.forEach((p) => {
      bounds.extend(p);
    });
    map.fitBounds(bounds);
  };

  const onLoad = React.useCallback(
    function callback(map: google.maps.Map) {
      const cityPositions = cities.map(
        (c) => new google.maps.LatLng(c.position)
      );
      var visitorMarker: google.maps.Marker | undefined = undefined;
      fitPositions(map, cityPositions);
      setMap(map);
      window.map = map;
      console.log(`fit bounds to ${cities.length} cities`);
      const extraControls = window.document.createElement("div");
      extraControls.style.marginBottom = "2em";
      extraControls.style.display = "flex";
      extraControls.style.flexDirection = "column";
      extraControls.innerHTML = `
        <button
          draggable="false" 
          aria-label="Use my location"
          title="Use my location"
          type="button"
          aria-pressed="true"
          style=" background: none padding-box rgb(255, 255, 255); display: table-cell; border: 0px; margin: 0px; padding: 0px 17px; text-transform: none; appearance: none; position: relative; cursor: pointer; user-select: none; direction: ltr; overflow: hidden; text-align: center; height: 40px; vertical-align: middle; color: rgb(0, 0, 0); font-family: Roboto, Arial, sans-serif; font-size: 18px; border-bottom-left-radius: 2px; border-top-left-radius: 2px; box-shadow: rgba(0, 0, 0, 0.3) 0px 1px 4px -1px; min-width: 35px; font-weight: 500; margin-bottom:1em;" aria-expanded="false">
            Use my location
          </button>`;
      extraControls.innerHTML += `
        <button
          draggable="false" 
          aria-label="View all cities"
          title="View all cities"
          type="button"
          aria-pressed="true"
          style="background: none padding-box rgb(255, 255, 255); display: table-cell; border: 0px; margin: 0px; padding: 0px 17px; text-transform: none; appearance: none; position: relative; cursor: pointer; user-select: none; direction: ltr; overflow: hidden; text-align: center; height: 40px; vertical-align: middle; color: rgb(0, 0, 0); font-family: Roboto, Arial, sans-serif; font-size: 18px; border-bottom-left-radius: 2px; border-top-left-radius: 2px; box-shadow: rgba(0, 0, 0, 0.3) 0px 1px 4px -1px; min-width: 35px; font-weight: 500;" aria-expanded="false">
            View All Cities
          </button>`;
      map.controls[window.google.maps.ControlPosition.BOTTOM_CENTER].push(
        extraControls
      );
      window.extraControls = extraControls;
      let buttons = extraControls.getElementsByTagName("button");

      buttons[1].addEventListener("click", () => {
        fitPositions(map, cityPositions);
      });

      buttons[0].addEventListener("click", () => {
        function success(pos: GeolocationPosition) {
          let currentPosition = new window.google.maps.LatLng({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          window.currentPosition = currentPosition;
          console.log("Your current position is:", currentPosition);
          var measurements = cities
            .map((city) => {
              let cityPosition = new window.google.maps.LatLng(city.position);
              return {
                city,
                cityPosition,
                distance:
                  window.google.maps.geometry.spherical.computeDistanceBetween(
                    currentPosition,
                    cityPosition
                  ),
              } as CityMeasurement;
            })
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 5);
          fitPositions(
            map,
            measurements.map((m) => m.cityPosition)
          );

          window.setTimeout(() => {
            if (visitorMarker) {
              visitorMarker.setMap(null);
            }
            visitorMarker = new window.google.maps.Marker({
              map,
              draggable: false,
              animation: window.google.maps.Animation.DROP,
              icon: "http://maps.google.com/mapfiles/kml/shapes/man.png", //'http://earth.google.com/images/kml-icons/track-directional/track-0.png'
              zIndex: 0,
              position: currentPosition,
            });
            visitorMarker.addListener("click", function toggleBounce() {
              if (!!visitorMarker) {
                if (visitorMarker.getAnimation() !== null) {
                  visitorMarker.setAnimation(null);
                } else {
                  visitorMarker.setAnimation(
                    window.google.maps.Animation.BOUNCE
                  );
                }
              }
            });
          }, 1000);

          console.log(measurements);
        }

        function error(err: GeolocationPositionError) {
          console.warn(`ERROR(${err.code}): ${err.message}`);
          alert(
            err.code === 3
              ? `Unable to get your location in a reasonable amount of time`
              : "Unable to get your location"
          );
        }

        window.navigator.geolocation.getCurrentPosition(success, error, {
          //for best performance: https://stackoverflow.com/questions/3752383/geolocation-is-so-slow-what-im-doing-wrong
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 1000 * 60,
        });
      });
    },
    [cities]
  );

  const onUnmount = React.useCallback(function callback(map) {
    setMap(null);
  }, []);

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      onLoad={onLoad}
      onUnmount={onUnmount}
    >
      {/* Child components, such as markers, info windows, etc. */}
      {cities.map((c) => (
        <CityMarker key={c.id} city={c} onClick={onSelect} />
      ))}
    </GoogleMap>
  ) : (
    <></>
  );
}

export default React.memo(MyComponent);
