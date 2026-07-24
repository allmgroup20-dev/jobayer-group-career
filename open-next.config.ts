import { defineCloudflareConfig } from "@opennextjs/cloudflare";

const cfConfig = defineCloudflareConfig({ enableCacheInterception: false });

export default {
  ...cfConfig,
  default: {
    ...cfConfig.default,
    minify: true,
    override: {
      ...cfConfig.default.override,
      incrementalCache: "dummy",
      tagCache: "dummy",
      queue: "dummy",
    },
  },
  edgeExternals: [...(cfConfig.edgeExternals || [])],
  cloudflare: cfConfig.cloudflare,
  dangerous: {
    disableTagCache: true,
    disableIncrementalCache: true,
    enableCacheInterception: false,
  },
  buildCommand: "next build",
};
