/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,css}", 
  ],
  theme: {
    extend: {
      colors: {
        // "Primal Mana" Theme - Now defined by CSS Variables
        primary: {
          DEFAULT: 'var(--color-primary)', 
          'light': 'var(--color-primary-light)', 
          'dark': 'var(--color-primary-dark)',  
        },
        secondary: {
          DEFAULT: 'var(--color-secondary)', 
          'dark': 'var(--color-secondary-dark)',
        },
        accent: {
          'blue': 'var(--color-accent-blue)',   
          'white': 'var(--color-accent-white)',  
          'black': 'var(--color-accent-black)',  
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