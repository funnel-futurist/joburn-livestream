/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { mono: ['ui-monospace', 'SFMono-Regular', 'monospace'] },
      colors: {
        forge: {
          ember: '#f97316',
          amber: '#fbbf24',
          cream: '#fef3c7',
          cyan: '#22d3ee',
          deep: '#1c1917'
        }
      }
    }
  },
  plugins: []
};
