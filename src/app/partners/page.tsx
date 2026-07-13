import type { Metadata } from "next";

import { PartnerBrief } from "./partner-brief";

export const metadata: Metadata = {
  title: "Partnership brief | Contrarian Debate Club",
  description:
    "A partnership brief for brands that want to reach Bengaluru's curious, high-agency young professionals.",
};

// The general brief, safe to send to anyone. A named partner gets the same deck
// plus a bespoke proposal at /partners/<slug>.
export default function PartnersPage() {
  return <PartnerBrief />;
}
