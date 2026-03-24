/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        skywash: "#e9f4ff",
        lavender: "#eee9ff",
        mist: "#f8fbff",
        ink: "#24324a",
        bloom: "#7c6cf2",
        calm: "#60a5fa",
      },
      boxShadow: {
        soft: "0 20px 60px rgba(96, 165, 250, 0.18)",
      },
    },
  },
  plugins: [],
};



