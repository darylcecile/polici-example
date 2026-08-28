import { definePlugin, type } from "polici/plugin-sdk";

export default definePlugin({
  name: "ownership",
  version: "1.0.1",
  policiApi: 1,
  contractMajor: 1,
  documentation: {
    summary: "Example repository ownership policy provider.",
  },
  exports: {
    approved: type.function({
      parameters: {
        owner: type.string({ enum: ["frontend", "platform"] }),
      },
      returns: type.boolean(),
      resolve: "approved",
      summary: "Whether this example repository recognizes the owner.",
    }),
  },
  runtime: {
    kind: "typescript",
    entrypoint: "./runtime.ts",
  },
});
