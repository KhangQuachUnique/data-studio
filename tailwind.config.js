/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}", "./shared/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        theme: {
          cream: "#F8F3F0",
          lilac: "#D0B8DC",
          mauve: "#B99BC8",
          plum: "#6F4F7A",
          ink: "#2F2733",
          blush: "#F1D7D4",
          sage: "#DDE8D5",
          mist: "#DDE4EC",
          butter: "#F3E8C8",
        },
      },
      fontFamily: {
        sans: ["Lexend", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "soft-panel": "0 24px 70px rgb(111 79 122 / 0.14)",
        "dark-panel": "0 28px 80px rgb(111 79 122 / 0.2)",
      },
    },
  },
  plugins: [],
};
