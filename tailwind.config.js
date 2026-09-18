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
        // Night mode colors
        night: {
          bg: '#101010',      // Ink Black
          surface: '#181818', // Soft Black
          elevated: '#222222',// Charcoal
          text: '#F4F0E8',    // Warm White
          muted: '#A8A2A5',   // Soft Grey
          border: '#3A3A3A',  // Defined Dark Grey
        },
        // Light mode colors (High contrast, warm and crisp)
        light: {
          bg: '#F7F3EA',      // Warm Cream
          surface: '#FFF9F0', // Soft Ivory
          elevated: '#FFFFFF',// Crisp Ivory
          text: '#191518',    // Deep Rich Cocoa Ink (High Contrast)
          muted: '#544B50',   // Defined Readable Cocoa Muted (High Contrast)
          border: '#C8BEAF',  // Defined Soft Warm Beige
        },
        // Pastel accent palette
        pastel: {
          yellow: '#F2E3A5', // Butter Yellow
          pink: '#E6B8C7',   // Dusty Pink
          lavender: '#CDBCE5', // Lavender
          sage: '#B9C9A9',   // Muted Sage
          blue: '#B8D0E6',   // Powder Blue
          mauve: '#C7A9BA',  // Muted Mauve
          // High-contrast ink equivalents for Light Mode text visibility
          'yellow-ink': '#8C6200',
          'pink-ink': '#8A2D50',
          'lavender-ink': '#583C7E',
          'sage-ink': '#365D2A',
          'blue-ink': '#24527D',
          'mauve-ink': '#6F3456',
        },
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'serif'],
        display: ['"DM Serif Display"', 'serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
