// Output formats. Every template renders inside a 1080-wide canvas and scales
// to these exact pixel dimensions, so one template serves all formats.

export type FormatId =
  | "ig-square"
  | "ig-portrait"
  | "ig-story"
  | "carousel-slide";

export interface Format {
  id: FormatId;
  label: string;
  width: number;
  height: number;
}

export const FORMATS: Record<FormatId, Format> = {
  "ig-portrait": { id: "ig-portrait", label: "IG Portrait", width: 1080, height: 1350 },
  "ig-square": { id: "ig-square", label: "IG Square", width: 1080, height: 1080 },
  "ig-story": { id: "ig-story", label: "IG Story", width: 1080, height: 1920 },
  "carousel-slide": { id: "carousel-slide", label: "Carousel Slide", width: 1080, height: 1350 },
};

export const FORMAT_LIST: Format[] = Object.values(FORMATS);
