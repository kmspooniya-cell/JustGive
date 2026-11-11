import type { Config } from "tailwindcss";
const config: Config = { content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"], theme: { extend: { colors: { brand: { ocean: "#087F8C", deep: "#173C42", darkOcean: "#105E65", mint: "#B8F0DF", paleMint: "#E7F8F1", champagne: "#FFF5E8", coral: "#FF8B78", peach: "#FFE1D8" } } } }, plugins: [] };
export default config;
