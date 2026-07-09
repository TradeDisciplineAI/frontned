/**
 * TypeScript interfaces for the globe.gl library.
 *
 * globe.gl has no official @types package. This file provides the type information
 * for the subset of the API that this project uses.
 *
 * If globe.gl releases official types in the future, delete this file and remove
 * the wildcard module declaration from types.d.ts.
 */

export interface GlobeControls {
  autoRotate: boolean;
  autoRotateSpeed: number;
  enableZoom: boolean;
}

export interface GlobeInstance {
  // Image layers
  globeImageUrl(url: string): GlobeInstance;
  bumpImageUrl(url: string): GlobeInstance;
  backgroundImageUrl(url: string): GlobeInstance;

  // Paths (stock chart lines)
  pathsData(data: PathData[]): GlobeInstance;
  pathPoints(key: string): GlobeInstance;
  pathPointLat(fn: (p: Coordinate) => number): GlobeInstance;
  pathPointLng(fn: (p: Coordinate) => number): GlobeInstance;
  pathPointAlt(fn: (p: Coordinate) => number): GlobeInstance;
  pathColor(fn: (d: PathData) => string): GlobeInstance;
  pathStroke(value: number): GlobeInstance;

  // Labels (country name overlays)
  labelsData(data: LabelData[]): GlobeInstance;
  labelLat(fn: (d: LabelData) => number): GlobeInstance;
  labelLng(fn: (d: LabelData) => number): GlobeInstance;
  labelText(fn: (d: LabelData) => string): GlobeInstance;
  labelSize(size: number): GlobeInstance;
  labelColor(fn: (d: LabelData) => string): GlobeInstance;
  labelDotRadius(r: number): GlobeInstance;

  // Polygons (country boundary fills)
  polygonsData(data: GeoFeature[]): GlobeInstance;
  polygonCapColor(fn: (d: GeoFeature) => string): GlobeInstance;
  polygonSideColor(fn: (d: GeoFeature) => string): GlobeInstance;
  polygonStrokeColor(fn: (d: GeoFeature) => string): GlobeInstance;
  polygonLabel(fn: (d: GeoFeature) => string): GlobeInstance;
  onPolygonHover(fn: (hoverD: GeoFeature | null) => void): GlobeInstance;

  // Camera
  pointOfView(pov: Partial<PointOfView>, durationMs?: number): GlobeInstance;
  width(w: number): GlobeInstance;
  height(h: number): GlobeInstance;
  controls(): GlobeControls;
}

/** [lat, lng, altitude] tuple used as a point in a globe path */
export type Coordinate = [lat: number, lng: number, alt: number];

export interface PathData {
  coords: Coordinate[];
  color: string;
}

export interface LabelData {
  lat: number;
  lng: number;
  text: string;
  color: string;
}

export interface GeoFeature {
  type: string;
  properties: {
    ADMIN: string;
    ISO_A2: string;
    [key: string]: string;
  };
  geometry: object;
}

export interface PointOfView {
  lat: number;
  lng: number;
  altitude: number;
}

export interface GeoJSON {
  type: 'FeatureCollection';
  features: GeoFeature[];
}
