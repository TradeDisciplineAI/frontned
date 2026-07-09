import { useEffect, useRef, useState, type RefObject } from 'react';
import Globe, { type GlobeInstance } from 'globe.gl';
import type { GeoJSON, GeoFeature, Coordinate, PathData, LabelData } from '@/types/globe.types';
import { NATIONS } from './nations.constants';
import { GLOBE_CONFIG } from './globe.constants';

/**
 * useGlobe — Custom hook that encapsulates all globe.gl logic.
 *
 * Responsibilities:
 *  - Initialises and configures the globe.gl instance (new Globe())
 *  - Runs the animation loop for waving stock chart paths
 *  - Handles resize + scroll-wheel-to-rotate events
 *  - Fetches and applies country boundary GeoJSON polygons
 *  - Exposes flyTo / resumeRotation controls to the UI component
 *
 * The UI component (GlobeView) is kept as a thin layout shell.
 */
export function useGlobe(containerRef: RefObject<HTMLDivElement | null>) {
  const globeInstanceRef = useRef<GlobeInstance | null>(null);
  const [activeCountry, setActiveCountry] = useState<string | null>(null);

  /** Fly the camera to a specific nation and pause auto-rotation */
  const flyTo = (name: string, lat: number, lng: number) => {
    setActiveCountry(name);
    const world = globeInstanceRef.current;
    if (world) {
      world.controls().autoRotate = false;
      world.pointOfView({ lat, lng, altitude: GLOBE_CONFIG.FLY_TO_ALTITUDE }, GLOBE_CONFIG.FLY_TO_DURATION_MS);
    }
  };

  /** Resume auto-rotation and clear the active country selection */
  const resumeRotation = () => {
    setActiveCountry(null);
    const world = globeInstanceRef.current;
    if (world) {
      world.controls().autoRotate = true;
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // ── 1. Initialise globe — globe.gl uses a class constructor ────────────
    const world = new Globe(container)
      .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-night.jpg')
      .bumpImageUrl('https://unpkg.com/three-globe/example/img/earth-topology.png')
      .backgroundImageUrl('https://unpkg.com/three-globe/example/img/night-sky.png')
      .pathPoints('coords')
      .pathPointLat((p: object) => (p as Coordinate)[0])
      .pathPointLng((p: object) => (p as Coordinate)[1])
      .pathPointAlt((p: object) => (p as Coordinate)[2])
      .pathColor((d: object) => (d as PathData).color)
      .pathStroke(GLOBE_CONFIG.PATH_STROKE)
      .labelsData(
        NATIONS.map((n) => ({ lat: n.lat, lng: n.lng, text: `${n.flag} ${n.name}`, color: n.color })),
      )
      .labelLat((d: object) => (d as LabelData).lat)
      .labelLng((d: object) => (d as LabelData).lng)
      .labelText((d: object) => (d as LabelData).text)
      .labelSize(GLOBE_CONFIG.LABEL_SIZE)
      .labelColor((d: object) => (d as LabelData).color)
      .labelDotRadius(GLOBE_CONFIG.LABEL_DOT_RADIUS);

    world.controls().autoRotate = true;
    world.controls().autoRotateSpeed = GLOBE_CONFIG.AUTO_ROTATE_SPEED;
    world.controls().enableZoom = true;
    globeInstanceRef.current = world;

    // ── 2. Animation loop ─────────────────────────────────────────────────
    // Pre-allocate arrays outside the loop to avoid 60fps garbage collection pressure.
    const pathCoordinateBuffers: Coordinate[][] = NATIONS.map(() =>
      Array.from<Coordinate>({ length: GLOBE_CONFIG.PATH_POINTS }).fill([0, 0, 0]),
    );
    const chartBuffer: PathData[] = NATIONS.map((n, i) => ({
      coords: pathCoordinateBuffers[i] as Coordinate[],
      color: n.color,
    }));

    let animationFrameId: number;

    const animate = () => {
      const t = Date.now() * GLOBE_CONFIG.ANIMATION_SPEED;

      NATIONS.forEach((nation, ni) => {
        const coords = pathCoordinateBuffers[ni] as Coordinate[];
        for (let i = 0; i < GLOBE_CONFIG.PATH_POINTS; i++) {
          const lngOffset = (i - GLOBE_CONFIG.PATH_POINTS / 2) * GLOBE_CONFIG.PATH_LONGITUDE_SPREAD;
          const alt = Math.max(
            0.01,
            GLOBE_CONFIG.PATH_BASE_ALTITUDE +
              Math.sin(i * 0.5 + t * 4) * GLOBE_CONFIG.PATH_WAVE_AMPLITUDE +
              Math.cos(i * 1.2 - t * 2) * 0.012,
          );
          coords[i] = [nation.lat + Math.sin(i) * 0.5, nation.lng + lngOffset, alt];
        }
      });

      world.pathsData(chartBuffer);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // ── 3. Resize handler ─────────────────────────────────────────────────
    const handleResize = () => {
      world.width(container.clientWidth).height(container.clientHeight);
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    // ── 4. Scroll-to-rotate ───────────────────────────────────────────────
    let scrollAngle = 0;
    const handleWheel = (e: WheelEvent) => {
      scrollAngle += e.deltaY * GLOBE_CONFIG.SCROLL_SENSITIVITY;
      world.pointOfView({ lat: 0, lng: scrollAngle, altitude: 2 });
    };
    window.addEventListener('wheel', handleWheel, { passive: true });

    // ── 5. Country boundary polygons (GeoJSON) ────────────────────────────
    let isMounted = true;
    // TODO (Phase 3 task): Download and serve from /public/ne_110m_countries.geojson locally
    fetch('https://unpkg.com/three-globe/example/img/ne_110m_admin_0_countries.geojson')
      .then((res) => res.json())
      .then((data: GeoJSON) => {
        if (!isMounted) return;
        world
          .polygonsData(data.features)
          .polygonCapColor(() => 'rgba(255, 255, 255, 0.01)')
          .polygonSideColor(() => 'rgba(0, 0, 0, 0.05)')
          .polygonStrokeColor(() => 'rgba(255, 255, 255, 0.25)')
          .polygonLabel(
            (d: object) => {
              const feature = d as GeoFeature;
              return `
                <div style="
                  background: rgba(10, 10, 10, 0.95);
                  border: 1px solid #ffffff;
                  padding: 6px 12px;
                  border-radius: 6px;
                  color: #fff;
                  font-family: 'Segoe UI', sans-serif;
                  font-size: 13px;
                  box-shadow: 0 0 10px rgba(255, 255, 255, 0.25);
                  pointer-events: none;
                ">
                  <strong>${feature.properties.ADMIN}</strong>
                </div>
              `;
            },
          )
          .onPolygonHover((hoverD: object | null) => {
            world
              .polygonCapColor((d: object) =>
                d === hoverD ? 'rgba(255, 255, 255, 0.18)' : 'rgba(255, 255, 255, 0.01)',
              )
              .polygonSideColor((d: object) =>
                d === hoverD ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
              );
          });
      })
      .catch((err: unknown) => {
        console.error('[useGlobe] Failed to load country boundaries GeoJSON:', err);
      });

    // ── Cleanup ───────────────────────────────────────────────────────────
    return () => {
      isMounted = false;
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('wheel', handleWheel);
      container.innerHTML = '';
      globeInstanceRef.current = null;
    };
  }, [containerRef]);

  return { activeCountry, flyTo, resumeRotation };
}
