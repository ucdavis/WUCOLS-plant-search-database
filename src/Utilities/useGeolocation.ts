import { useState, useEffect } from "react";

const defaultSettings = {
  enableHighAccuracy: false,
  timeout: Infinity,
  maximumAge: 0,
};

export const useGeolocation = (watch = false, settings = defaultSettings) => {
  const [position, setPosition] = useState({});
  const [error, setError] = useState<string | null>(null);

  const onChange = ({ coords, timestamp }: GeolocationPosition) => {
    setPosition({
      lat: coords.latitude,
      lng: coords.longitude,
      accuracy: coords.accuracy,
      timestamp,
    });
  };

  const onError = (error: GeolocationPositionError) => {
    setError(error.message);
  };

  useEffect(() => {
    if (!navigator || !navigator.geolocation) {
      setError("Geolocation is not supported");
      return;
    }

    let watcher: number | null = null;
    if (watch) {
      watcher = navigator.geolocation.watchPosition(
        onChange,
        onError,
        settings
      );
    } else {
      navigator.geolocation.getCurrentPosition(onChange, onError, settings);
    }

    return () => {
      watcher && navigator.geolocation.clearWatch(watcher);
    };
  }, [
    watch,
    settings,
    settings.enableHighAccuracy,
    settings.timeout,
    settings.maximumAge,
  ]);

  return { ...position, error };
};
