/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#f7f4ee",
        ink: "#161616",
        smoke: "#5d5d62",
        line: "#e8e1d7",
        accent: "#5968ff",
        accentDeep: "#3a49dd"
      },
      boxShadow: {
        panel: "0 18px 60px -28px rgba(25, 24, 35, 0.16)",
        hover: "0 24px 75px -28px rgba(46, 45, 70, 0.22)"
      },
      borderRadius: {
        panel: "24px"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};
