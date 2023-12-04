export const fetchGeoLocation = (callback: any) => {
  if (navigator.geolocation.getCurrentPosition) {
    navigator.geolocation.getCurrentPosition(
      (data) => {
        const { coords } = data;
        if (callback instanceof Function) {
          callback({
            lng: coords.longitude,
            lat: coords.latitude,
            alt: 20,
          });
        }
      },
      (error) => {
        if (callback instanceof Function) {
          callback(error);
        }
      },
      { maximumAge: 60 * 60 * 1000 }
    );
  }
};
