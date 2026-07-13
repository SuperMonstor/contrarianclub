// A PosterSpec is the data a template renders. Edit these by hand as .ts files
// in src/posters/. (Supabase-event wiring can come later.)

export type TemplateId = "editorial" | "statement";

export interface DetailRow {
  label: string;
  value: string;
}

export interface PosterSpec {
  /** filename-safe id, used by the export CLI: `npm run poster <id>` */
  id: string;
  template: TemplateId;

  /** small gold uppercase tracked-out line above the title */
  kicker: string;
  /** the hero */
  title: string;
  /** one sentence directly under the title */
  oneLiner?: string;

  /** optional short list / row of supporting points */
  points?: string[];

  /** the details block (date, time, entry, …) */
  details?: DetailRow[];

  /** optional ceremonial closing line */
  closing?: string;

  /** optional treated background image (path under /public or src asset URL) */
  image?: {
    src: string;
    /** how far the image bleeds in from the right (editorial) or fills (statement) */
    treatment?: "duotone" | "scrim" | "full";
  };
}
