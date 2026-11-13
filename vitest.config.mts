import { configDefaults, defineConfig } from "vitest/config";
import path from "node:path";
export default defineConfig({ test: { environment: "jsdom", globals: true, exclude: [...configDefaults.exclude, ".agents/**", ".claude/**"] }, resolve: { alias: { "@": path.resolve(import.meta.dirname, "src") } } });
