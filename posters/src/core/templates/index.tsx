import type { SlideSpec, TemplateId } from "../types";
import type { Format } from "../formats";
import { Editorial } from "./Editorial";
import { Statement } from "./Statement";
import { Versus } from "./Versus";

const TEMPLATES: Record<
  TemplateId,
  (props: { spec: SlideSpec; format: Format }) => React.ReactNode
> = {
  editorial: Editorial,
  statement: Statement,
  versus: Versus,
};

export function renderTemplate(spec: SlideSpec, format: Format) {
  const Tmpl = TEMPLATES[spec.template];
  return <Tmpl spec={spec} format={format} />;
}
