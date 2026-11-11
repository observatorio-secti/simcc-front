// Tailwind preset Simcc — presets: [require("./tokens/tailwind.preset.js")]
module.exports = {
  theme: {
    extend: {
      colors: {
        sm: {
          navy: "#2B2D74", sky: "#5B9BDD", red: "#D43441",
          canvas: "#FAFAFA", wash: "#EFF1F4",
          "wave-blue": "#D1DEE6", "wave-gray": "#DEE0E3", "wave-faint": "#EDEEEF",
          "navy-900": "#1B1D4D", "navy-600": "#4A4C8F",
          "sky-600": "#3F7FC4", "sky-100": "#E1EDF9",
          "red-700": "#B52633", "red-100": "#F9E3E4",
        },
      },
      fontFamily: { sans: ["Lexend", "system-ui", "sans-serif"] },
      borderRadius: { sm: "4px", md: "8px", lg: "12px" },
    },
  },
};
