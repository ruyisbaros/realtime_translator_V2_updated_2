import debug_screen from "tailwindcss-debug-screens";
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      width: {
        electron: "1000px", // Add a custom class for Electron-specific dimensions
      },
      height: {
        electron: "800px", // Add a custom class for Electron-specific dimensions
      },
      colors: {
        p1: "#2EF2FF",
        p2: "#3C52D9",
        p3: "#C8EA80",
        p4: "#EAEDFF",
        p5: "#C4CBF5",
        s1: "#080D27",
        s2: "#0C1838",
        s3: "#334679",
        s4: "#1959AD",
        s5: "#263466",
        black: {
          DEFAULT: "#000000",
          100: "#05091D",
        },
        primary: "hsl(224, 92%, 15%)",
        primary_d: "#020817",
        grayy: "#3a3f4c",
        the_black: "#0f1015",
        primary_hex: "#031649",
        blue: {
          50: "#E0F2FE", // Light Ice Blue
          100: "#93C5FD", // Sky Blue
          200: "#60A5FA", // Light Blue
          300: "#2563EB", // Cobalt Blue
          400: "#1D4ED8", // Indigo Blue
          500: "#0A74DA", // Strong Azure
          600: "#00308F", // Royal Blue
          700: "#002E6E", // Deep Sky Blue
          800: "#001F54", // Navy Blue
          900: "#041E42", // Space Blue
        },
      },
      debugScreens: {
        position: ["top", "left"],
        prefix: "Breakpoint: ",
        style: {
          backgroundColor: "#000",
          color: "#fff",
          padding: "5px",
          borderRadius: "5px",
          fontSize: "12px",
        },
      },
      fontFamily: {
        montserrat: ["Montserrat", "sans-serif"],
        poppins: ["Poppins", "sans-serif"],
        orbitron: ["Orbitron", "sans-serif"],
        exo2: ["Exo 2", "sans-serif"],
        playfair: ["Playfair Display", "serif"],
        lora: ["Lora", "serif"],
        raleway: ["Raleway", "sans-serif"],
        quicksand: ["Quicksand", "sans-serif"],
        oswald: ["Oswald", "sans-serif"],
        anton: ["Anton", "sans-serif"],
      },
    },
    screens: {
      sm: "640px", // Small devices (phones)
      md: "768px", // Medium devices (tablets)
      lg: "1024px", // Large devices (desktops)
      xl: "1280px", // Extra large devices
      "2xl": "1536px", // Ultra large screens
    },
  },
  plugins: [debug_screen],
};
