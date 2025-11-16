/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,css}", 
  ],
  theme: {
    extend: {
      colors: {
        // "Primal Mana" Theme
        primary: {
          DEFAULT: '#619A5A', 
          'light': '#8BC34A', 
          'dark': '#38703A',  
        },
        secondary: {
          DEFAULT: '#D32F2F', 
          'dark': '#B71C1C',
        },
        accent: {
          'blue': '#0D47A1',   
          'white': '#F5F5DC',  
          'black': '#212121',  
        },
        neutral: {
          '100': '#F5F5DC', 
          '200': '#E0E0E0', 
          '700': '#4E342E', 
          '800': '#212121', 
          '900': '#263238', 
          '950': '#1b2327', 
        }
      },
      fontFamily: {
        'display': ['Merriweather', 'serif'], 
        'body': ['Lato', 'sans-serif'],        
      },
      
      // --- ADD THIS BLOCK ---
      transitionDuration: {
        'fast': '150ms',
        'med': '300ms',
      }
      // ----------------------
    },
  },
  plugins: [],
}