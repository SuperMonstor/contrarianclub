import { networkInterfaces } from "node:os";

function getConfiguredSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
}

function getLocalNetworkUrl() {
  const explicitUrl = process.env.LOCAL_NETWORK_URL?.replace(/\/$/, "");
  if (explicitUrl) return explicitUrl;

  const port =
    process.env.PORT ||
    process.env.NEXT_PUBLIC_DEV_PORT ||
    getConfiguredSiteUrl()?.match(/^https?:\/\/[^:/]+:(\d+)/)?.[1] ||
    "3002";

  for (const interfaces of Object.values(networkInterfaces())) {
    for (const network of interfaces ?? []) {
      if (network.family === "IPv4" && !network.internal) {
        return `http://${network.address}:${port}`;
      }
    }
  }

  return undefined;
}

export function getSiteUrl() {
  if (process.env.NODE_ENV !== "production") {
    return (
      getLocalNetworkUrl() ||
      getConfiguredSiteUrl() ||
      "http://localhost:3002"
    );
  }

  return getConfiguredSiteUrl() || "http://localhost:3002";
}

export function buildEventUrls(code: string) {
  const baseUrl = getSiteUrl();

  return {
    joinUrl: `${baseUrl}/join/${code}`,
    presenterUrl: `${baseUrl}/present/${code}`,
    hostUrl: `${baseUrl}/host/${code}`,
  };
}
