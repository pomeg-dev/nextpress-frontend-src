type urlString = string;

export function getLastPath(urlString: urlString) {
  // if is not a valid url string
  if (urlString.includes("http") === false)
    urlString = "https://www.website.com/" + urlString;
  const url = new URL(urlString);
  const path = url.pathname.split("/");
  if (path[path.length - 1] === "/") path.pop();
  if (path[path.length - 1] === "") path.pop();
  return "/" + path[path.length - 1];
}

export function getBaseURL(url: string) {
  const urlObj = new URL(url);
  return `${urlObj.protocol}//${urlObj.host}/`;
}

// function which is run on every link to replace wordpress urls with next ones (header/mobile nav and footer navs).
export function linkFilter(linkUrl: string | undefined, apiUrl?: string) {
  const API_URL = apiUrl ? apiUrl : process.env.NEXT_PUBLIC_API_URL;
  if (!linkUrl) return "#";
  if (linkUrl.includes('.pdf')) return linkUrl;
  
  let newLinkUrl = linkUrl;
  
  // Replace the API_URL with the base url.
  if (API_URL) {
    newLinkUrl = linkUrl.replace(API_URL, "");
  }

  return newLinkUrl;
}

export function getFrontEndUrl(settings: any) {
  let frontendDomainURL = "http://localhost:3000";
  if (settings.frontend_url) {
    frontendDomainURL = settings.frontend_url;
  }
  return frontendDomainURL;
};