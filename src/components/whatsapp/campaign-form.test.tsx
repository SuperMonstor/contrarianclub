import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

const uploadToSignedUrl = vi.fn().mockResolvedValue({ data: {}, error: null });

vi.mock("@/app/admin/whatsapp/actions", () => ({
  createWhatsAppCampaign: vi.fn(),
  createWhatsAppPosterUpload: vi.fn().mockResolvedValue({
    ok: true,
    bucket: "whatsapp-posters",
    path: "poster.png",
    token: "upload-token",
    publicUrl: "https://project.supabase.co/storage/v1/object/public/whatsapp-posters/poster.png",
  }),
}));

vi.mock("@/lib/supabase/browser", () => ({
  createBrowserClient: () => ({
    storage: { from: () => ({ uploadToSignedUrl }) },
  }),
}));

import { CampaignForm } from "@/components/whatsapp/campaign-form";

describe("WhatsApp campaign form", () => {
  it("previews the approved template and needs a poster, HTTPS link, and charge confirmation", async () => {
    const user = userEvent.setup();
    render(<CampaignForm activeSubscriberCount={1842} />);
    expect(screen.getByText("1,842 active recipients")).toBeInTheDocument();

    await user.type(screen.getByLabelText("Debate number"), "12");
    await user.click(screen.getByLabelText("Invite only"));
    await user.type(screen.getByLabelText("Early access price (₹)"), "599");
    await user.type(screen.getByLabelText("Location"), "BIC");
    await user.type(screen.getByLabelText("Time"), "Saturday, 7:00 PM");
    await user.type(screen.getByLabelText("Offlyn event link"), "https://tickets.test/debate");
    await user.click(screen.getByLabelText("I understand Meta messaging charges may apply"));

    expect(
      screen.getByText("Contrarian Debate Club #12 (invite only)"),
    ).toBeInTheDocument();
    expect(screen.getByText(/tickets are capped at ₹599/)).toBeInTheDocument();
    expect(screen.getByText("Book Now")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("must start with https://offlyn.life/");

    const button = screen.getByRole("button", { name: "Create and send campaign" });
    expect(button).toBeDisabled();

    await user.clear(screen.getByLabelText("Offlyn event link"));
    await user.type(screen.getByLabelText("Offlyn event link"), "https://offlyn.life/e/ncWEIfi");
    expect(button).toBeDisabled();

    const poster = new File(["poster"], "poster.png", { type: "image/png" });
    await user.upload(screen.getByLabelText("Poster"), poster);
    await waitFor(() => expect(button).toBeEnabled());
    expect(uploadToSignedUrl).toHaveBeenCalledWith("poster.png", "upload-token", poster, {
      contentType: "image/png",
    });
    expect(screen.getByAltText("Poster preview")).toHaveAttribute(
      "src",
      "https://project.supabase.co/storage/v1/object/public/whatsapp-posters/poster.png",
    );
  });

  it("rejects posters WhatsApp cannot send before uploading", async () => {
    const user = userEvent.setup({ applyAccept: false });
    render(<CampaignForm activeSubscriberCount={3} />);
    await user.upload(
      screen.getByLabelText("Poster"),
      new File(["gif"], "poster.gif", { type: "image/gif" }),
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Choose a JPEG or PNG image.");
    expect(screen.getByRole("button", { name: "Create and send campaign" })).toBeDisabled();
  });

  it("fills the number from a chosen debate", async () => {
    const user = userEvent.setup();
    render(
      <CampaignForm
        activeSubscriberCount={3}
        debates={[
          {
            id: "event-1",
            code: "ABC123",
            title: "Debate #12",
            debateNumber: "12",
          },
        ]}
      />,
    );
    await user.selectOptions(screen.getByLabelText("Fill from a debate"), "event-1");
    expect(screen.getByLabelText("Debate number")).toHaveValue("12");
  });
});
