/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,html}"],
  theme: {
    extend: {
      colors: {
        paper: "#f4f5f7",
        surface: "#ffffff",
        ink: "#101828",
        "ink-muted": "#667085",
        line: "#d8dde6",
        accent: "#10213f",
        "accent-muted": "#e8edf5",
        success: "#237a4b",
        "success-soft": "#e8f4ee",
        danger: "#b42318",
        "danger-soft": "#fbe9e7",
        warning: "#b54708",
        "warning-soft": "#fff1d7"
      },
      borderRadius: {
        control: "6px",
        panel: "8px"
      },
      boxShadow: {
        panel: "0 18px 42px rgba(16, 24, 40, 0.08)",
        control: "0 1px 2px rgba(16, 24, 40, 0.08)"
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
