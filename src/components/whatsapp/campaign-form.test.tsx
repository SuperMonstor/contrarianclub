import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/app/admin/whatsapp/actions", () => ({
  createWhatsAppCampaign: vi.fn(),
}));

import { CampaignForm } from "@/components/whatsapp/campaign-form";

describe("WhatsApp campaign form", () => {
  it("previews the approved copy and requires HTTPS plus charge confirmation", async () => {
    const user = userEvent.setup();
    render(<CampaignForm activeSubscriberCount={1842} />);
    expect(screen.getByText("1,842 active recipients")).toBeInTheDocument();

    await user.type(screen.getByLabelText("Debate title"), "Should AI replace engineers?");
    await user.type(screen.getByLabelText("Date"), "Thursday, August 27");
    await user.type(screen.getByLabelText("Time"), "7:00 PM");
    await user.type(screen.getByLabelText("Venue"), "BIC");
    await user.type(screen.getByLabelText("Ticket URL"), "http://tickets.test/debate");

    expect(screen.getByText("Hi there, bookings are open for the next Contrarian Club debate.")).toBeInTheDocument();
    expect(screen.getByText("Should AI replace engineers?")).toBeInTheDocument();
    const button = screen.getByRole("button", { name: "Create and send campaign" });
    expect(button).toBeDisabled();

    await user.clear(screen.getByLabelText("Ticket URL"));
    await user.type(screen.getByLabelText("Ticket URL"), "https://tickets.test/debate");
    await user.click(screen.getByLabelText("I understand Meta messaging charges may apply"));
    expect(button).toBeEnabled();
  });
});
