import { defineConfig } from "vite";
import { resolve } from "path";
import cesium from "vite-plugin-cesium";
import dts from "vite-plugin-dts";
import copy from "rollup-plugin-copy";

export default defineConfig({
  plugins: [
    {
      ...cesium(),
      apply: "serve",
    },
    dts({
      insertTypesEntry: true,
      compilerOptions: {
        moduleResolution: 99,
        allowSyntheticDefaultImports: true,
      },
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, "src/lib/index.ts"),
      name: "CesiumClusterer",
      fileName: "cesium-clusterer",
    },
    rollupOptions: {
      external: ["cesium"],
      output: {
        globals: {
          cesium: "Cesium",
        },
        plugins: [
          copy({
            targets: [{ src: ["package.json", "README.md"], dest: "dist/" }],
            hook: "writeBundle",
          }),
        ],
      },
    },
  },
});
