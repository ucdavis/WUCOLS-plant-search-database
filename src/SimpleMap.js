import React, { Component } from 'react';
import GoogleMapReact from 'google-map-react';

const AnyReactComponent = ({ text }) => 
    <h4>
        <span className="badge badge-primary">{text}</span>
    </h4>;

class SimpleMap extends Component {

  render() {
    let p = {
        lat: 38.6540627,
        lng: -121.7993056
    };
    let props = {
        center: p,
        zoom: 11
    };
    return (
      // Important! Always set the container height explicitly
      <div style={{ height: '100vh', width: '100%' }}>
        <GoogleMapReact
          bootstrapURLKeys={{ key: '' }}
          defaultCenter={props.center}
          defaultZoom={props.zoom}
        >
          <AnyReactComponent
            {...p}
            text="My Marker"
          />
        </GoogleMapReact>
      </div>
    );
  }
}

export default SimpleMap;