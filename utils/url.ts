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
export function linkFilter(linkUrl: string, API_URL: any) {
  let newLinkUrl = linkUrl;
  //first replace the API_URL with the base url
  newLinkUrl = linkUrl.replace(API_URL, "");

  return newLinkUrl;
}
