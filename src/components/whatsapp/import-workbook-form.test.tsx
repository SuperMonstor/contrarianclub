import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ImportWorkbookForm } from "@/components/whatsapp/import-workbook-form";

const originalFetch = global.fetch;

afterEach(() => {
  global.fetch = originalFetch;
  vi.restoreAllMocks();
});

describe("WhatsApp workbook import form", () => {
  it("keeps the workbook for preview and confirmation", async () => {
    const user = userEvent.setup();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            ready: true,
            sheetName: "Guests",
            headers: ["Name", "Phone", "WhatsApp updates", "Time"],
            detection: { mapping: {}, ambiguous: [], missing: [], candidates: {} },
            mapping: {
              name: "Name",
              phone: "Phone",
              consent: "WhatsApp updates",
              preferenceTime: "Time",
            },
            alreadyImported: false,
            sourceDateRequired: false,
            totalRows: 42,
            validRows: 41,
            issues: [
              {
                rowNumber: 7,
                maskedPhone: "+91******3210",
                message: "Consent must be Yes or No.",
              },
            ],
            counts: {
              addedCount: 34,
              updatedCount: 2,
              deactivatedCount: 1,
              unchangedCount: 4,
              invalidCount: 1,
            },
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            importId: "import-1",
            addedCount: 34,
            updatedCount: 2,
            deactivatedCount: 1,
            unchangedCount: 4,
            invalidCount: 1,
          }),
          { status: 200 },
        ),
      );
    global.fetch = fetchMock;
    render(<ImportWorkbookForm />);

    const file = new File(["workbook"], "debate-guests.xlsx");
    await user.upload(screen.getByLabelText("Excel workbook"), file);
    expect(screen.getByText("debate-guests.xlsx")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Preview import" }));
    expect(await screen.findByText("34 will be added")).toBeInTheDocument();
    expect(screen.getByText("Row 7")).toBeInTheDocument();
    expect(screen.getByText("+91******3210")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Confirm import" }));
    expect(await screen.findByText("Import complete")).toBeInTheDocument();
    expect(screen.getByText("1 invalid")).toBeInTheDocument();

    expect(fetchMock).toHaveBeenCalledTimes(2);
    const previewBody = fetchMock.mock.calls[0][1]?.body as FormData;
    const confirmBody = fetchMock.mock.calls[1][1]?.body as FormData;
    expect(previewBody.get("file")).toBe(file);
    expect(confirmBody.get("file")).toBe(file);
  });

  it("shows mapping choices and requires a source date without timestamps", async () => {
    const user = userEvent.setup();
    global.fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          ready: false,
          sheetName: "Guests",
          headers: ["Name", "Phone", "Updates", "WhatsApp updates"],
          detection: {
            mapping: { name: "Name", phone: "Phone", preferenceTime: null },
            ambiguous: ["consent"],
            missing: [],
            candidates: {
              name: ["Name"],
              phone: ["Phone"],
              consent: ["Updates", "WhatsApp updates"],
              preferenceTime: [],
            },
          },
          alreadyImported: false,
          sourceDateRequired: true,
        }),
        { status: 200 },
      ),
    );
    render(<ImportWorkbookForm />);
    await user.upload(
      screen.getByLabelText("Excel workbook"),
      new File(["workbook"], "guests.xlsx"),
    );
    await user.click(screen.getByRole("button", { name: "Preview import" }));

    expect(await screen.findByLabelText("Consent column")).toBeInTheDocument();
    expect(screen.getByLabelText("Source debate date")).toBeRequired();
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Preview with mapping" }),
      ).toBeDisabled(),
    );
  });

  it("reveals the source date when an ambiguous time column is left unused", async () => {
    const user = userEvent.setup();
    global.fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          ready: false,
          sheetName: "Guests",
          headers: ["Name", "Phone", "WhatsApp updates", "Created", "Purchased"],
          detection: {
            mapping: {
              name: "Name",
              phone: "Phone",
              consent: "WhatsApp updates",
            },
            ambiguous: ["preferenceTime"],
            missing: [],
            candidates: {
              name: ["Name"],
              phone: ["Phone"],
              consent: ["WhatsApp updates"],
              preferenceTime: ["Created", "Purchased"],
            },
          },
          alreadyImported: false,
          sourceDateRequired: false,
        }),
        { status: 200 },
      ),
    );
    render(<ImportWorkbookForm />);
    await user.upload(
      screen.getByLabelText("Excel workbook"),
      new File(["workbook"], "guests.xlsx"),
    );
    await user.click(screen.getByRole("button", { name: "Preview import" }));

    expect(await screen.findByLabelText("Source debate date")).toBeRequired();
  });
});
