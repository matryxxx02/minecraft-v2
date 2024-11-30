export const Config = {
  // Canvas
  canvas: {
    sky_color: 0x80a0e0,
    camera_position: [-20, 20, -20],
    sun: {
      position: [50, 50, 50],
      cast_shadow: true,
      shadow: {
        camera: {
          left: -50,
          right: 50,
          bottom: -50,
          top: 50,
          near: 0.1,
          far: 100,
        },
        bias: -0.0001,
        map_size: [2048, 2048],
      },
    },
    ambient_light: {
      intensity: 0.5,
    },
  },

  // Scene
  scene: {
    fog: {
      color: 0x80a0e0,
      near: 50,
      far: 60,
    },
    orbit_controls: {
      target: [16, 16, 16],
    },
  },

  // Miscellnsaeous
  misc: {
    debug_mode: false, // If true, shows cameraHelper, boundsHelper, helpers for collision detection
    show_fps: true, // Display FPS counter
    show_gui: true, // Show GUI for debugging
  },
} as const;
