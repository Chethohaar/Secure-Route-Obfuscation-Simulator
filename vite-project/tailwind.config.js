/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "cyber-black": "#0a0a0f",
        "cyber-blue": "#00f3ff",
        "cyber-pink": "#ff00ff",
        "cyber-purple": "#9d00ff",
        "cyber-green": "#00ff9d",
        "cyber-yellow": "#ffd700",
        "cyber-red": "#ff0055",
      },
      boxShadow: {
        "neon-blue": "0 0 5px #00f3ff, 0 0 20px #00f3ff",
        "neon-pink": "0 0 5px #ff00ff, 0 0 20px #ff00ff",
        "neon-green": "0 0 5px #00ff9d, 0 0 20px #00ff9d",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        glow: "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        glow: {
          "0%": { boxShadow: "0 0 5px #00f3ff, 0 0 20px #00f3ff" },
          "100%": { boxShadow: "0 0 10px #00f3ff, 0 0 30px #00f3ff" },
        },
      },
    },
  },
  plugins: [],
};
