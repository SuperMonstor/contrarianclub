export function getSiteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "http://localhost:3000"
  );
}

export function buildEventUrls(code: string) {
  const baseUrl = getSiteUrl();

  return {
    joinUrl: `${baseUrl}/join/${code}`,
    presenterUrl: `${baseUrl}/present/${code}`,
    hostUrl: `${baseUrl}/host/${code}`,
  };
}
