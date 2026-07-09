/**
 * Re-export globe.gl types from the package's own declaration file.
 *
 * globe.gl ships with proper TypeScript declarations at:
 *   node_modules/globe.gl/dist/globe.gl.d.ts
 *
 * The package exports a class constructor: new Globe(element, configOptions?)
 * Usage: const world = new Globe(containerElement);
 *
 * Our custom interface types (Coordinate, PathData, GeoFeature, etc.) live in:
 *   src/types/globe.types.ts
 */
export type { GlobeInstance, ConfigOptions } from 'globe.gl';
