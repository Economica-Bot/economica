module.exports = {
  mode: "jit",
  purge: ["./src/**/*.{ts,tsx}", "./public/index.html"],
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: true,
  theme: {
    colors: {
      transparent: "transparent",
      current: "currentColor",
      white: "#ffffff",
      primary: "#5057ff",
      danger: "#ff5050",
      success: "#57f288",
      blurple: "#7289da",
      discord: {
        900: "#202225",
        800: "#2f3136",
        700: "#36393f",
        600: "#40444b",
        500: "#72767d",
        400: "#829297",
      },
    },
    extend: {
      fontFamily: {
        expletus_sans: ["Expletus Sans", "sans-serif"],
        lato: ["Lato", "sans-serif"],
        roboto: ["Roboto", "sans-serif"],
        economica: ["Economica", "sans-serif"],
        pt_sans: ["PT Sans", "sans-serif"],
      },
      boxShadow: {
        drop: "0px 24px 38px 3px rgb(0 0 0 / 14%), 0px 9px 46px 8px rgb(0 0 0 / 12%), 0px 11px 15px -7px rgb(0 0 0 / 20%)",
        "3xl":
          "0px -24px 38px 3px rgba(0, 0, 0, 0.14), 0px -9px 46px 8px rgba(0, 0, 0, 0.12), 0px -11px 15px -7px rgba(0, 0, 0, 0.2)",
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("daisyui"),
    function ({ addVariant }) {
      addVariant("children", "& > *");
    },
  ],
};
