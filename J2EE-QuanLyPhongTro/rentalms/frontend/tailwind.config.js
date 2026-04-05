/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-body)", "Nunito", "sans-serif"],
        display: ["var(--font-display)", "Playfair Display", "serif"]
      },
      colors: {
        primary: "var(--color-primary)",
        "primary-dark": "var(--color-primary-dark)",
        "primary-light": "var(--color-primary-light)",
        secondary: "var(--color-secondary)",
        "secondary-dark": "var(--color-secondary-dark)",
        "secondary-light": "var(--color-secondary-light)",
        navy: "var(--color-navy)",
        "navy-mid": "var(--color-navy-mid)",
        cream: "var(--color-cream)",
        surface: "var(--color-surface)",
        page: "var(--color-page-bg)",
        "page-green": "var(--color-page-bg-green)",
        muted: "var(--color-text-muted)",
        border: "var(--color-border)",
        "auth-bg": "var(--color-auth-bg)",
        "auth-surface": "var(--color-auth-surface)",
        "auth-text": "var(--color-auth-text)",
        "auth-muted": "var(--color-auth-muted)",
        "auth-border": "var(--color-auth-border)",
        "auth-primary": "var(--color-auth-primary)",
        "auth-primary-dark": "var(--color-auth-primary-dark)",
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        danger: "var(--color-danger)",
        listing: "var(--color-orange-listing)",
        "listing-bg": "var(--color-orange-listing-bg)",
        "brand-green": "#22C55E",
        "brand-green-dark": "#16A34A",
        "brand-orange": "#E8622A",
        "brand-orange-dark": "#C94E1A",
        "brand-navy": "#1B2B4B",
        "brand-cream": "#F2C185"
      },
      borderRadius: {
        card: "var(--radius-card)",
        "card-lg": "var(--radius-card-lg)",
        btn: "var(--radius-btn)"
      },
      boxShadow: {
        card: "var(--shadow-card)",
        "card-hover": "var(--shadow-card-hover)",
        btn: "var(--shadow-btn)",
        soft: "var(--shadow-soft)"
      },
      spacing: {
        sidebar: "var(--sidebar-width)"
      },
      maxWidth: {
        shell: "1500px"
      }
    }
  },
  plugins: []
};
