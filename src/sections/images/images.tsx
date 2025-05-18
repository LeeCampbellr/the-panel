import { getImages } from "./getImages";
import { ImageData } from "./types";

export function Images() {
  const images = getImages();

  return (
    <ul>
      {images.map((image) => (
        <li key={image.src}>{image.src}</li>
      ))}
    </ul>
  );
}
