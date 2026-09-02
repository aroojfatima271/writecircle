/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F6F3EC',
        paperDim: '#EDE8DB',
        ink: '#1B1E2B',
        inkSoft: '#3A3E52',
        wine: '#7A2E3B',
        wineDeep: '#5C2129',
        pine: '#3F6656',
        gold: '#C9A227',
        muted: '#8C8577',
      },
      fontFamily: {
        display: ['"Fraunces"', 'ui-serif', 'Georgia', 'serif'],
        body: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        prose: '68ch',
      },
    },
  },
  plugins: [],
};
