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
  const Tmpl = TEMPLATES[spec.template];
  return <Tmpl spec={spec} format={format} />;
}
