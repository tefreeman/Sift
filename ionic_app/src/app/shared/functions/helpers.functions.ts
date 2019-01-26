

const R = 6378137;
const PI_360 = Math.PI / 360;

interface IDistancePos {
    lat: number;
    lon: number;
}
export function distance(a: IDistancePos, b: IDistancePos): number {
    const cLat = Math.cos((a.lat + b.lat) * PI_360);
    const dLat = (b.lat - a.lat) * PI_360;
    const dLon = (b.lon - a.lon) * PI_360;
    const f = dLat * dLat + cLat * cLat * dLon * dLon;
    const c = 2 * Math.atan2(Math.sqrt(f), Math.sqrt(1 - f));
    return R * c;
  }
  