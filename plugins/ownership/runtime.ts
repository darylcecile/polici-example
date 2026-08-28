import { defineRuntime } from "polici/runtime-sdk";
import plugin from "./plugin.ts";

export default defineRuntime(plugin, {
  resolvers: {
    approved(_context, { owner }) {
      return owner === "frontend" || owner === "platform";
    },
  },
});
