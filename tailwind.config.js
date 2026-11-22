/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#000000',
          dark: '#000000',
          soft: '#0a0a0a',
        },
        ink: {
          DEFAULT: '#000000',
          mute: '#5a5a5f',
          light: '#ffffff',
        },
        'on-primary': {
          DEFAULT: '#ffffff',
          mute: '#f0f0fa',
        },
        canvas: {
          night: '#000000',
          'night-soft': '#0a0a0a',
          light: '#ffffff',
          cool: '#f0f0fa',
        },
        hairline: {
          onDark: '#3a3a3f',
          onLight: '#e0e0e8',
        },
        link: {
          onDark: '#ffffff',
          fallback: '#0000ee',
        },
        telemetry: {
          danger: '#ef4444',
          warning: '#f59e0b',
          success: '#10b981',
        },
      },
      fontFamily: {
        din: ['"D-DIN-Bold"', '"D-DIN"', '"Arial Narrow"', 'Inter', 'Arial', 'sans-serif'],
        display: ['"D-DIN-Bold"', '"D-DIN"', '"Arial Narrow"', 'Inter', 'Arial', 'sans-serif'],
        body: ['"D-DIN"', 'Inter', 'Arial', 'Verdana', 'sans-serif'],
        sans: ['"D-DIN"', 'Inter', 'Arial', 'sans-serif'],
        tabular: ['"D-DIN"', 'Inter', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        pill: '32px',
        full: '9999px',
      },
      spacing: {
        xxs: '4px',
        xs: '8px',
        sm: '12px',
        md: '16px',
        lg: '18px',
        xl: '24px',
        xxl: '32px',
        huge: '48px',
      },
      letterSpacing: {
        'display-xxl': '1.6px',
        'display-xl': '1.2px',
        'display-lg': '0.96px',
        'button-cap': '1.17px',
        'micro-cap': '0.96px',
        'body-lg': '0.32px',
        'body-md': '0.32px',
      },
      lineHeight: {
        'display-xxl': '0.95',
        'display-xl': '1.2',
        'display-lg': '1.25',
        'button-cap': '0.94',
        'micro-cap': '2.0',
        'body-lg': '1.7',
        'body-md': '1.5',
      },
      boxShadow: {
        none: 'none',
      },
    },
  },
  plugins: [],
}
