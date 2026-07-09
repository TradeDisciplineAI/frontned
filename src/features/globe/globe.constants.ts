/**
 * Globe configuration constants.
 * All magic numbers from the animation loop are named here for clarity and easy tuning.
 */
export const GLOBE_CONFIG = {
  // Camera
  AUTO_ROTATE_SPEED: 0.5,
  FLY_TO_ALTITUDE: 1.8,
  FLY_TO_DURATION_MS: 2000,

  // Animation timing
  ANIMATION_SPEED: 0.0015, // Multiplier on Date.now() — higher = faster waves

  // Path (stock chart line) shape
  PATH_POINTS: 15, // Number of data points per waving line
  PATH_LONGITUDE_SPREAD: 1.5, // Horizontal spread of each chart across its country
  PATH_BASE_ALTITUDE: 0.05, // Base height of the lines above the globe surface
  PATH_WAVE_AMPLITUDE: 0.03, // How tall the waves are
  PATH_STROKE: 2.5, // Line thickness in WebGL units

  // Labels
  LABEL_SIZE: 1.5,
  LABEL_DOT_RADIUS: 0.4,

  // Scroll-to-rotate
  SCROLL_SENSITIVITY: 0.05,
} as const;
