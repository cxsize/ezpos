/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        bg: '#fbfaf7',
        'bg-soft': '#f3efe8',
        panel: '#ffffff',
        'panel-2': '#f8f5ef',
        ink: {
          DEFAULT: '#1a1614',
          2: '#68615c',
          3: '#a39c96',
        },
        line: {
          DEFAULT: '#ece7df',
          2: '#ddd5c8',
        },
        burgundy: {
          DEFAULT: '#7a1a37',
          d: '#5e1329',
          l: '#eec9d3',
          ll: '#f7ebef',
        },
        forest: {
          DEFAULT: '#355e4c',
        },
        yellow: {
          DEFAULT: '#c99a2b',
        },
        danger: {
          DEFAULT: '#9c3232',
        },
      },
      fontFamily: {
        sans: ['Geist', 'NotoSansThai', 'System'],
        serif: ['BodoniModa', 'NotoSerifThai', 'Georgia'],
      },
      fontSize: {
        'micro': ['10px', { lineHeight: '14px', letterSpacing: '0.18em' }],
      },
      borderRadius: {
        sm: '10px',
        md: '14px',
        lg: '20px',
        xl: '28px',
      },
    },
  },
  plugins: [],
};
