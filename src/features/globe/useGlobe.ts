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
      world.pointOfView(
        { lat, lng, altitude: GLOBE_CONFIG.FLY_TO_ALTITUDE },
        GLOBE_CONFIG.FLY_TO_DURATION_MS,
      );
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
      .ringsData(
        NATIONS.map((n) => ({
          lat: n.lat,
          lng: n.lng,
        })),
      )
      .ringColor(() => '#3b82f6') // Blue
      .ringMaxRadius(3) // Size of the blink
      .ringPropagationSpeed(2) // Speed of the pulse
      .ringRepeatPeriod(1000); // Blinks every 1 second

    world.controls().autoRotate = true;
    world.controls().autoRotateSpeed = GLOBE_CONFIG.AUTO_ROTATE_SPEED;
    world.controls().enableZoom = false; // Disabled to prevent scroll trapping
    globeInstanceRef.current = world;

    // Initialize globe as small (altitude 4.0)
    setTimeout(() => {
      if (world) {
        const pov = world.pointOfView();
        world.pointOfView({ ...pov, altitude: 4.0 });
      }
    }, 50);

    // ── 2. Increase Globe Brightness ──────────────────────────────────────
    setTimeout(() => {
      if (!world) return;
      const scene = world.scene();
      scene.children.forEach((child: any) => {
        if (child.type === 'AmbientLight') {
          child.intensity = 4.5; // Significantly brighter ambient light
        }
        if (child.type === 'DirectionalLight') {
          child.intensity = 3.0; // Significantly brighter directional light
        }
      });
    }, 100);

    // No external animation loop is needed since blinking is handled via CSS.

    // ── 3. Resize handler ─────────────────────────────────────────────────
    const handleResize = () => {
      world.width(container.clientWidth).height(container.clientHeight);
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    // ── 4. Smart Scroll: Zoom + Rotate + Page Scroll Handoff ──────────────
    let scrollAngle = 0;
    const handleWheel = (e: WheelEvent) => {
      if (!world) return;
      
      const currentPov = world.pointOfView();
      let newAltitude = currentPov.altitude;
      
      // Calculate new altitude (zoom)
      // Reverse logic: Scroll DOWN (deltaY > 0) -> Zoom IN (decrease altitude)
      // Scroll UP (deltaY < 0) -> Zoom OUT (increase altitude)
      const zoomSpeed = 0.002;
      newAltitude -= e.deltaY * zoomSpeed;
      
      // Bounds: 1.5 = Large globe (Image 1), 4.0 = Small globe (Image 2)
      if (newAltitude < 1.5) newAltitude = 1.5;
      if (newAltitude > 4.0) newAltitude = 4.0;
      
      // If scrolling UP and the globe is already at its smallest (4.0), 
      // release the scroll event so the user scrolls back to the top of the page!
      if (e.deltaY < 0 && currentPov.altitude >= 3.99) {
        return; 
      }
      
      // Otherwise, prevent page scroll and apply zoom & rotation to the globe
      e.preventDefault();
      
      // Rotation
      scrollAngle += e.deltaY * GLOBE_CONFIG.SCROLL_SENSITIVITY;
      
      world.pointOfView({ lat: currentPov.lat, lng: scrollAngle, altitude: newAltitude });
    };
    
    // Attach to container, passive: false so we can preventDefault
    container.addEventListener('wheel', handleWheel, { passive: false });

    // ── 5. Country boundary polygons (GeoJSON) ────────────────────────────
    let isMounted = true;
    // TODO (Phase 3 task): Download and serve from /public/ne_110m_countries.geojson locally
    fetch('https://unpkg.com/three-globe/example/img/ne_110m_admin_0_countries.geojson')
      .then((res) => res.json())
      .then((data: GeoJSON) => {
        if (!isMounted) return;
        world
          .polygonsData(data.features)
          .polygonCapColor(() => 'rgba(255, 255, 255, 0.15)') // Brighter nation fill
          .polygonSideColor(() => 'rgba(255, 255, 255, 0.05)')
          .polygonStrokeColor(() => 'rgba(255, 255, 255, 0.8)') // Brighter nation borders
          .polygonLabel((d: object) => {
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
          })
          .onPolygonHover((hoverD: object | null) => {
            world
              .polygonCapColor((d: object) =>
                d === hoverD ? 'rgba(255, 255, 255, 0.35)' : 'rgba(255, 255, 255, 0.15)',
              )
              .polygonSideColor((d: object) =>
                d === hoverD ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
              );
          });
      })
      .catch((err: unknown) => {
        console.error('[useGlobe] Failed to load country boundaries GeoJSON:', err);
      });

    // ── Cleanup ───────────────────────────────────────────────────────────
    return () => {
      isMounted = false;
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('wheel', handleWheel);
      if (globeInstanceRef.current) {
        globeInstanceRef.current._destructor();
      }
      container.innerHTML = '';
      globeInstanceRef.current = null;
    };
  }, [containerRef]);

  return { activeCountry, flyTo, resumeRotation };
}
