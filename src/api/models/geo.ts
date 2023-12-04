export class GeoLoc {
  lat = 0;
  lng = 0;
  alt = 0;

  constructor(inData: any = null) {
    if (inData instanceof Object) {
      Object.entries(inData).forEach(([k, v]) => {
        if (typeof v === "number") {
          switch (k) {
            case "lat":
            case "latitude":
              this.lat = v;
              break;
            case "lng":
            case "longitude":
            case "lon":
              this.lng = v;
              break;
            case "alt":
            case "altitude":
              this.alt = v;
              break;
          }
        }
      });
    }
  }

  toString() {
    return [this.lat, this.lng, this.alt].join(",");
  }
}
