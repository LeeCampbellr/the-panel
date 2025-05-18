export interface ImageData {
  src: string;
  alt: string | null;
  width: string | null;
  height: string | null;
  loading: string | null;
  fetchPriority: string | null;
  srcset: string | null;
  isBelowFold: boolean;
}
