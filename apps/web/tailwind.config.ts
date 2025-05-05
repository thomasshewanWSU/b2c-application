import sharedConfig from "@repo/tailwind-config";
import type { Config } from "tailwindcss";

const config: Pick<Config, "prefix" | "presets" | "content" | "darkMode"> = {
  content: [
    "./src/**/*.tsx",
    "../../packages/ui/src/**/*.tsx",
    "./src/**/*.module.css",
  ],
  darkMode: ["class", '[data-theme="dark"]'], // Support both class and data-theme
  presets: [sharedConfig],
};

export default config;
