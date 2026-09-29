import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StrictMode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { createClient, getUser, updateUser, signOut, replace } = vi.hoisted(() => ({
  createClient: vi.fn(),
  getUser: vi.fn(),
  updateUser: vi.fn(),
  signOut: vi.fn(),
  replace: vi.fn(),
}));

vi.mock("@supabase/supabase-js", () => ({ createClient }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));

import { AdminSetPasswordForm } from "@/components/admin-set-password-form";

describe("admin invitation password setup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://project.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "public-key";
    createClient.mockReturnValue({ auth: { getUser, updateUser, signOut } });
    getUser.mockResolvedValue({ data: { user: { email: "rajathmagaji@gmail.com" } }, error: null });
    updateUser.mockResolvedValue({ error: null });
    signOut.mockResolvedValue({ error: null });
  });

  it("shows an expired-link state without a password form when the invite has no user", async () => {
    getUser.mockResolvedValue({ data: { user: null }, error: new Error("expired") });
    render(<AdminSetPasswordForm />);

    expect(await screen.findByText(/invitation link is invalid or expired/i)).toBeInTheDocument();
    expect(screen.queryByLabelText("New password")).toBeNull();
  });

  it("uses a temporary implicit invite client and rejects mismatched passwords", async () => {
    const user = userEvent.setup();
    render(<StrictMode><AdminSetPasswordForm /></StrictMode>);
    await screen.findByLabelText("New password");
    expect(createClient).toHaveBeenCalledTimes(1);
    expect(createClient).toHaveBeenCalledWith(
      "https://project.supabase.co",
      "public-key",
      { auth: expect.objectContaining({ flowType: "implicit", detectSessionInUrl: true, persistSession: false, autoRefreshToken: false }) },
    );

    await user.type(screen.getByLabelText("New password"), "secure-password-123");
    await user.type(screen.getByLabelText("Confirm password"), "different-password-123");
    await user.click(screen.getByRole("button", { name: "Set password" }));

    expect(screen.getByRole("alert")).toHaveTextContent("Passwords do not match");
    expect(updateUser).not.toHaveBeenCalled();
  });

  it("updates the invited user's password, ends the invite session, and opens login", async () => {
    const user = userEvent.setup();
    render(<AdminSetPasswordForm />);
    await screen.findByLabelText("New password");

    await user.type(screen.getByLabelText("New password"), "secure-password-123");
    await user.type(screen.getByLabelText("Confirm password"), "secure-password-123");
    await user.click(screen.getByRole("button", { name: "Set password" }));

    await waitFor(() => expect(updateUser).toHaveBeenCalledWith({ password: "secure-password-123" }));
    await waitFor(() => expect(signOut).toHaveBeenCalledWith({ scope: "local" }));
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/admin/login"));
  });

  it("keeps the form open when Supabase rejects the new password", async () => {
    const user = userEvent.setup();
    updateUser.mockResolvedValue({ error: new Error("Password rejected") });
    render(<AdminSetPasswordForm />);
    await screen.findByLabelText("New password");

    await user.type(screen.getByLabelText("New password"), "secure-password-123");
    await user.type(screen.getByLabelText("Confirm password"), "secure-password-123");
    await user.click(screen.getByRole("button", { name: "Set password" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Password rejected");
    expect(signOut).not.toHaveBeenCalled();
    expect(replace).not.toHaveBeenCalled();
  });
});
