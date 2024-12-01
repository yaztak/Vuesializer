import vue from "rollup-plugin-vue";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";
import babel from "@rollup/plugin-babel";
import postcss from "rollup-plugin-postcss";
import postcssImport from "postcss-import";
import postcssUrl from "postcss-url";

export default {
  input: "src/components/Vuesializer.vue",
  output: [
    {
      file: "dist/vuesializer.cjs.js",
      format: "cjs",
    },
    {
      file: "dist/vuesializer.esm.js",
      format: "es",
    },
    {
      file: "dist/vuesializer.umd.js",
      format: "umd",
      name: "Vuesializer",
    },
  ],
  plugins: [
    resolve(),
    commonjs(),
    vue({
      css: true,
      compileTemplate: true,
      scoped: true,
    }),
    postcss({
      plugins: [
        postcssImport(),
        postcssUrl({
          url: "inline", // Inline assets as base64 URIs
          // OR
          // url: "copy", // Copy files to the output directory and adjust the URLs
        }),
      ],

      extract: false, // Extract CSS into a separate file
    }),
    babel({
      exclude: "node_modules/**",
      babelHelpers: "runtime",
      presets: ["@babel/preset-env"],
      plugins: ["@babel/plugin-transform-runtime"],
    }),
    terser(),
  ],
  external: ["vue", "@babel/runtime"],
};
