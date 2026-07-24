import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default {
  ...defineCloudflareConfig({ enableCacheInterception: false }),
  default: {
    minify: true,
    override: {
      wrapper: "cloudflare-node",
      converter: "edge",
      proxyExternalRequest: "fetch",
      incrementalCache: "dummy",
      tagCache: "dummy",
      queue: "dummy",
    },
  },
  dangerous: {
    disableTagCache: true,
    disableIncrementalCache: true,
    enableCacheInterception: false,
  },
  buildCommand: "next build",
};
