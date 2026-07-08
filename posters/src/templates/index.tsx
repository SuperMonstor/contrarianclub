import type { PosterSpec, TemplateId } from "../types";
import type { Format } from "../formats";
import { Editorial } from "./Editorial";
import { Statement } from "./Statement";

const TEMPLATES: Record<
  TemplateId,
  (props: { spec: PosterSpec; format: Format }) => React.ReactNode
> = {
  editorial: Editorial,
  statement: Statement,
};

export function renderTemplate(spec: PosterSpec, format: Format) {
  const Tmpl = TEMPLATES[spec.template];
  return <Tmpl spec={spec} format={format} />;
}
