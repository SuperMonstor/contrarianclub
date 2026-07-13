import type { SlideSpec, TemplateId } from "../types";
import type { Format } from "../formats";
import { Editorial } from "./Editorial";
import { Statement } from "./Statement";
import { Versus } from "./Versus";
import { Panel } from "./Panel";

const TEMPLATES: Record<
  TemplateId,
  (props: { spec: SlideSpec; format: Format }) => React.ReactNode
> = {
  editorial: Editorial,
  statement: Statement,
  versus: Versus,
  panel: Panel,
};

export function renderTemplate(spec: SlideSpec, format: Format) {
  // A work can bring its own renderer instead of naming a stock template.
  const Tmpl =
    typeof spec.template === "function" ? spec.template : TEMPLATES[spec.template];
  return <Tmpl spec={spec} format={format} />;
}
