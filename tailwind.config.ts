const withMT = require("@material-tailwind/react/utils/withMT");
const plugin = require("tailwindcss/plugin");
module.exports = withMT({
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        playfair_display: ["Playfair Display", "serif"],
        mulish: ["Mulish", "sans-serif"],
        lexend: ["Lexend", "sans-serif"],
        poppins: ["Poppins", "sans-serif"],
        nohemi300: ["NohemiLight", "sans-serif"],
        nohemi200: ["NohemiExtraLight", "sans-serif"],
        nohemi400: ["NohemiRegular", "sans-serif"],
        nohemi500: ["NohemiBold", "sans-serif"],
        nohemi600: ["NohemiExtraBold", "sans-serif"],
      },
      backgroundSize: {
        "full-100": "100% 100%",
      },
      animation: {
        marquee: "marquee 10s linear infinite",
        rotate: "rotate 4s linear infinite",
        shineMovement: "shineMovement 12s infinite ease-in-out",
        slideInTop: "slideInTop 0.5s ease-out",
        slideOutTop: "slideOutTop 0.5s ease-in",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(-100%)" },
        },
        rotate: {
          "0%": { transform: "rotateY(0deg)" },
          "100%": { transform: "rotateY(360deg)" },
        },
        shineMovement: {
          "0%": "",
          "100%": {
            backgroundPosition: "20% 20%, 80% 80%, 50% 50%",
            backgroundSize: "100% 100%, 100% 100%, 100% 100%",
          },
          "20%": {
            backgroundPosition: "50% 20%, 30% 90%, 80% 10%",
            backgroundSize: "150% 150%, 150% 150%, 150% 150%",
          },
          "40%": {
            backgroundPosition: "80% 30%, 20% 20%, 50% 80%",
            backgroundSize: "200% 200%, 200% 200%, 200% 200%",
          },
          "60%": {
            backgroundPosition: "30% 50%, 70% 20%, 40% 60%",
            backgroundSize: "150% 150%, 150% 150%, 150% 150%",
          },
          "80%": {
            backgroundPosition: "20% 80%, 80% 50%, 30% 30%",
            backgroundSize: "100% 100%, 100% 100%, 100% 100%",
          },
        },
        slideInTop: {
          "0%": { transform: "translateY(-100%)", opacity: 0 },
          "100%": { transform: "translateY(0)", opacity: 1 },
        },
        slideOutTop: {
          "0%": { transform: "translateY(0)", opacity: 1 },
          "100%": { transform: "translateY(-100%)", opacity: 0 },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "custom-radial": `radial-gradient(circle at 20% 20%, rgba(155, 255, 224, 0.4), transparent 30%), radial-gradient(circle at 60% 80%, rgba(190, 220, 100, 0.3), transparent 30%), radial-gradient(circle at 50% 50%, rgba(180, 255, 224, 0.2), transparent 25%)`,
      },
      screens: {
        pixel: "0px",
        mobile: "479px",
        tablet: "768px",
        laptop: "1024px",
        mac: "1200px",
        desktop: "1440px",
      },
    },
    colors: {
      primary: "#C0A0FF",
      pac_man: {
        50: "#FFFCF7",
        100: "#FFF4DF",
        200: "#FFEABF",
        300: "#FFDFA0",
        400: "#FFD57F",
        500: "#FFCA5F",
        600: "#CCA24C",
        700: "#997A3A",
        800: "#665126",
        900: "#332813",
      },
      noble_black: {
        50: "#F9F9F9",
        100: "#E8E9E9",
        200: "#CDCECF",
        300: "#9C9D9F",
        400: "#686B6E",
        500: "#363A3D",
        600: "#1A1D21",
        700: "#15181B",
        800: "#0D0F10",
        900: "#060708",
      },
      dracula: {
        100: "#FEE0E3",
        200: "#FEC2C8",
        300: "#FDA3AC",
        400: "#FD8591",
        500: "#FC6675",
        600: "#CA525E",
        700: "#973D46",
        800: "#65292F",
        900: "#321417",
      },
      moss: {
        100: "#CCF4EF",
        200: "#99E9DF",
        300: "#66DECF",
        400: "#33D3BF",
        500: "#00C8AF",
        600: "#00A08C",
        700: "#02796A",
        800: "#005046",
        900: "#002823",
      },
      sky: {
        100: "#DDF2FA",
        200: "#BCE5F5",
        300: "#9BD9F1",
        400: "#79CBEB",
        500: "#57BEE6",
        600: "#4698B8",
        700: "#35738B",
        800: "#234C5C",
        900: "#11262E",
      },
      dark: {
        DEFAULT: "#14191F80",
        50: "#768293",
        100: "#31373F",
        200: "#000000",
      },
    },
  },
  // plugins: [
  //   plugin(function ({ addUtilities }: { addUtilities: any }) {
  //     const newUtilities = {
  //       ".bg-gradient": {
  //         // "border-radius": "12px",
  //         border: "1px solid var(--ui-divider, rgba(82, 82, 111, 0.25))",
  //         background: "var(--ui-file-background, rgba(67, 69, 99, 0.17))",
  //         "box-shadow": "0px 2px 4px 0px rgba(0, 0, 0, 0.10)",
  //         "backdrop-filter": "blur(17.5px)",
  //       }
  //     };

  //     addUtilities(newUtilities, ["responsive", "hover"]);
  //   }),
  // ],
});
