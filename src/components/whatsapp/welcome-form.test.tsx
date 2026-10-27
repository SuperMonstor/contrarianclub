import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

const uploadToSignedUrl = vi.fn().mockResolvedValue({ data: {}, error: null });

vi.mock("@/app/admin/whatsapp/actions", () => ({
  createWhatsAppWelcomeCampaign: vi.fn(),
  createWhatsAppPosterUpload: vi.fn().mockResolvedValue({
    ok: true,
    bucket: "whatsapp-posters",
    path: "image.jpg",
    token: "upload-token",
    publicUrl: "https://project.supabase.co/storage/v1/object/public/whatsapp-posters/image.jpg",
  }),
}));

vi.mock("@/lib/supabase/browser", () => ({
  createBrowserClient: () => ({
    storage: { from: () => ({ uploadToSignedUrl }) },
  }),
}));

import { WelcomeForm } from "@/components/whatsapp/welcome-form";

describe("WhatsApp welcome form", () => {
  it("previews the approved welcome and needs an image plus charge confirmation", async () => {
    const user = userEvent.setup();
    render(<WelcomeForm pendingCount={4} />);
    expect(screen.getByText("4 recipients")).toBeInTheDocument();
    expect(
      screen.getByText(/^Hi Asha, you're receiving this message/),
    ).toBeInTheDocument();

    const send = () => screen.getByRole("button", { name: "Send welcome message" });
    expect(send()).toBeDisabled();
    await user.click(screen.getByLabelText("I understand Meta messaging charges may apply"));
    expect(send()).toBeDisabled();

    await user.upload(
      screen.getByLabelText("Image"),
      new File(["image"], "image.jpg", { type: "image/jpeg" }),
    );
    await waitFor(() => expect(send()).toBeEnabled());
    expect(screen.getByAltText("Poster preview")).toHaveAttribute(
      "src",
      "https://project.supabase.co/storage/v1/object/public/whatsapp-posters/image.jpg",
    );
  });

  it("says when everyone has been welcomed", () => {
    render(<WelcomeForm pendingCount={0} />);
    expect(screen.getByText("Every active subscriber has been welcomed.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Send welcome message" })).toBeNull();
  });
});
