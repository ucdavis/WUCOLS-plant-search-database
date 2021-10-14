import React from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '70vh'
};

const CityMarker = ({city,onClick}) => {
    const markerRef = React.useRef(null);
    let iw = new window.google.maps.InfoWindow({
      content: `<div>${city.name}</div>`
    });
    const setNameVisible = v => {
        if(v){
            let marker = markerRef.current.marker;
            let map = marker.map;
            iw.open({
              anchor: marker,
              map,
              shouldFocus: false
            });
        } else {
          iw.close();
        }
    };
    return <>
        <Marker 
            position={city.position}
            ref={ref => markerRef.current = ref}
            onClick={() => onClick(city)}
            onMouseOver={() => {setNameVisible(true)}}
            onMouseOut={() => {setNameVisible(false)}}
        />
    </>;
};

function MyComponent({cities,onSelect}) {

    const dev = true;
    const apiKey = dev ? "AIzaSyBCZkKqXgoURncqEtUCs4ErDb7qeaHt80I" : "AIzaSyCKJG-QM3eR7YESp5E7xXcAGrB2Pjo21ZM";
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey
  })

  const [, setMap] = React.useState(null)

  const onLoad = React.useCallback(function callback(map) {
    const bounds = new window.google.maps.LatLngBounds();
    cities.forEach(c => {
        bounds.extend(c.position);
    });
    map.fitBounds(bounds);
    setMap(map)
  }, [cities])

  const onUnmount = React.useCallback(function callback(map) {
    setMap(null)
  }, [])

  return isLoaded ? (
      <GoogleMap
        mapContainerStyle={containerStyle}
        onLoad={onLoad}
        onUnmount={onUnmount}
      >
        { /* Child components, such as markers, info windows, etc. */ }
        {cities.map(c => <CityMarker key={c.id} city={c} onClick={onSelect}/> )}
      </GoogleMap>
  ) : <></>
}

export default React.memo(MyComponent)