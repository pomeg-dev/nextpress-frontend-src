interface Window {
  dataLayer?: {
    event: string;
    page: string;
  }[];
}

export const pageview = (url: string) => {
  (window as unknown as Window).dataLayer?.push({
    event: "pageview",
    page: url,
  });
};
