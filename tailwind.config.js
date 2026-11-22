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
        fintech: {
          bg: '#EFEFEF',              // Canvas background directly from photo
          card: '#FFFFFF',            // Pure white card surface
          obsidian: '#1E1E1E',        // Card 1 Total Balance background
          panel: '#1C1C1C',           // Right panel & sidebar background
          dock: '#1C1C1C',            // Left vertical dock background
          lime: '#C4FC51',            // Exact neon lime from photo (Visa card & badge)
          limeHover: '#B8F540',
          limeSoft: '#C3EA75',        // Income growth tag bg
          limeDark: '#165A00',
          purple: '#675DFC',          // Exact purple from photo (+ buttons & wave)
          purpleHover: '#584EED',
          purpleDock: '#6458E2',      // Dock active capsule from photo
          purpleBar: '#625BFF',       // Expences active bar from photo
          purpleCurve: '#A298DF',     // Income line curve from photo
          textDark: '#1C1C1C',        // Primary dark text from photo
          textMuted: '#909090',       // Muted subtitle and label text from photo
          textSubtle: '#666666',
          borderSoft: '#E5E5E5',
          borderDark: '#282828',
          tooltip: '#0E0E0E',         // Dark tooltips ($4121, $2121) from photo
        },
        primary: {
          DEFAULT: '#1C1C1C',
          dark: '#000000',
          soft: '#0a0a0a',
        },
        surface: {
          dark: '#1E1E1E',
          night: '#1C1C1C',
          card: '#FFFFFF',
          cardHover: '#FAFAFA',
          border: '#E5E5E5',
          borderHover: '#CCCCCC',
        },
        ink: {
          DEFAULT: '#1C1C1C',
          primary: '#1C1C1C',
          secondary: '#666666',
          mute: '#909090',
          light: '#ffffff',
        },
        telemetry: {
          danger: '#f43f5e',
          warning: '#f59e0b',
          success: '#10b981',
          neutral: '#909090',
        },
      },
      fontFamily: {
        sans: ['"Outfit"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Outfit"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        '2xl': '24px',
        '3xl': '28px',
        '4xl': '32px',
        pill: '9999px',
        full: '9999px',
      },
      boxShadow: {
        fintech: '0 8px 24px -4px rgba(0, 0, 0, 0.04)',
        fintechHover: '0 12px 30px -4px rgba(0, 0, 0, 0.07)',
        fintechCard: '0 6px 20px -3px rgba(0, 0, 0, 0.03)',
        fintechDark: '0 16px 36px -8px rgba(0, 0, 0, 0.35)',
      },
    },
  },
  plugins: [],
}
