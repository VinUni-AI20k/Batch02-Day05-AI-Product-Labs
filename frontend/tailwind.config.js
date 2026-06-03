/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
        },
        travel: {
          sky: "#0ea5e9",
          ocean: "#0369a1",
          sand: "#fbbf24",
          forest: "#16a34a",
        },
      },
    },
  },
  plugins: [],
};
