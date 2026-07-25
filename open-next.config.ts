import { defineCloudflareConfig } from "@opennextjs/cloudflare";

const cf = defineCloudflareConfig({ enableCacheInterception: false });

export default {
  ...cf,
  default: {
    ...cf.default,
    minify: true,
    override: {
      ...cf.default.override,
      incrementalCache: "dummy",
      tagCache: "dummy",
      queue: "dummy",
    },
  },
  dangerous: {
    ...cf.dangerous,
    disableTagCache: true,
    disableIncrementalCache: true,
  },
};
