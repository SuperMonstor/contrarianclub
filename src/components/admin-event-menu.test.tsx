import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { AdminEventMenu } from "@/components/admin-event-menu";

describe("admin event menu", () => {
  it("opens Generate assets for the chosen event and closes with Escape", async () => {
    const user = userEvent.setup();
    render(
      <AdminEventMenu
        eventTitle="Debate 10"
        assetsHref="/admin/events/J66N6A/assets"
      />,
    );

    const button = screen.getByRole("button", { name: "Actions for Debate 10" });
    expect(button).toHaveAttribute("aria-expanded", "false");
    await user.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", { name: "Generate assets" })).toHaveAttribute(
      "href",
      "/admin/events/J66N6A/assets",
    );
    await user.keyboard("{Escape}");
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("link", { name: "Generate assets" })).toBeNull();
  });
});
