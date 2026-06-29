/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,html}"],
  theme: {
    extend: {
      colors: {
        paper: "#fff2c8",
        surface: "#fffdf7",
        ink: "#17213b",
        "ink-muted": "#625b70",
        line: "#f2c94c",
        accent: "#00875a",
        "accent-muted": "#dff8e8",
        sun: "#ffd447",
        coral: "#ff5a3d",
        magenta: "#d91a72",
        turquoise: "#00a6b4",
        success: "#00875a",
        "success-soft": "#dff8e8",
        danger: "#b42318",
        "danger-soft": "#ffe5df",
        warning: "#b54708",
        "warning-soft": "#fff0bf"
      },
      borderRadius: {
        control: "6px",
        panel: "8px"
      },
      boxShadow: {
        panel: "0 18px 42px rgba(114, 68, 0, 0.12)",
        control: "0 2px 0 rgba(23, 33, 59, 0.14)"
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif"
        ]
      }
    }
  },
  plugins: []
};
