/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    // This line is the fix. We are adding 'css' to the list.
    "./src/**/*.{js,ts,jsx,tsx,css}", 
  ],
  theme: {
    extend: {
      colors: {
        // "Primal Mana" Theme
        primary: {
          DEFAULT: '#619A5A', // A rich, medium "Forest" green
          'light': '#8BC34A', // Lighter "Plains" accent
          'dark': '#38703A',  // Deep "Swamp" green
        },
        secondary: {
          DEFAULT: '#D32F2F', // "Mountain" Red (for destructive actions)
          'dark': '#B71C1C',
        },
        accent: {
          'blue': '#0D47A1',   // "Island" Blue (for primary buttons)
          'white': '#F5F5DC',  // "Plains" White (parchment-like)
          'black': '#212121',  // "Swamp" Black (card backgrounds)
        },
        neutral: {
          '100': '#F5F5DC', // Light "Parchment" text
          '200': '#E0E0E0', // Lighter gray text
          '700': '#4E342E', // "Stone" or "Wood" border
          '800': '#212121', // "Swamp" / Dark card background
          '900': '#263238', // Deep "Forest" main app background
          '950': '#1b2327', // Darker hover
        }
      },
      fontFamily: {
        'display': ['Merriweather', 'serif'], // Your "Display" font
        'body': ['Lato', 'sans-serif'],        // Your "Body" font
      },
    },
  },
  plugins: [],
}