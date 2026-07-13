"use client";

import styles from "./page.module.css";

export function ExportPdfButton() {
  async function exportPdf() {
    const images = Array.from(document.images);
    await Promise.all(
      images.map((image) => {
        if (image.complete) return image.decode().catch(() => undefined);
        return new Promise<void>((resolve) => {
          image.addEventListener("load", () => resolve(), { once: true });
          image.addEventListener("error", () => resolve(), { once: true });
        });
      }),
    );
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    );
    window.print();
  }

  return (
    <div className={styles.exportBar}>
      <div>
        <p>Ready to share?</p>
        <span>Exports as an A4 landscape PDF with the deck formatting applied.</span>
      </div>
      <button type="button" onClick={exportPdf}>
        Export landscape PDF <span aria-hidden="true">↓</span>
      </button>
    </div>
  );
}
