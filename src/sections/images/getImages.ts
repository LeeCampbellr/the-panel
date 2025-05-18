import { ImageData } from "./types";

export function getImages(): ImageData[] {
  const imageElements = document.querySelectorAll(
    "body :not([data-seo-toolkit]) img"
  );

  const images = Array.from(imageElements).map((img) => {
    const rect = img.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const isBelowFold = rect.top > viewportHeight;

    return {
      src: img.getAttribute("src") || "",
      alt: img.getAttribute("alt"),
      width: img.getAttribute("width"),
      height: img.getAttribute("height"),
      loading: img.getAttribute("loading"),
      fetchPriority: img.getAttribute("fetchpriority"),
      srcset: img.getAttribute("srcset"),
      isBelowFold,
    };
  });

  return images;
}
