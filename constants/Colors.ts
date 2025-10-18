const main = "#00B4D8"; // Azul neon (energia)
const accent = "#FF006E"; // Rosa magenta (contraste)
const black = "#0A0A0F"; // Fundo profundo
const gray = "#1E1E25"; // Estrutura industrial
const white = "#E0E0E0"; // Interface clara

const Colors = {
  main,
  accent,
  black,
  gray,
  white,
  light: {
    text: "#101010",
    background: "#F8F8F8",
    tint: main,
    icon: "#606060",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: main,
  },
  dark: {
    text: "#F1F1F1",
    background: black,
    tint: main,
    icon: "#B0B0B0",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: accent,
  },
};

export default Colors;