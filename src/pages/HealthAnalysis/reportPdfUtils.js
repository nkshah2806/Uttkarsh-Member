/**
 * PDF action helpers for the Final Report page.
 *
 * The compiled report HTML returned by `POST /v1/visits/:id/generate-pdf` is the
 * single source of truth for the report. Both "Download PDF" and "Share on
 * WhatsApp" use this exact same HTML to produce the PDF, so the downloaded /
 * shared document always matches the generated report (header & logo, patient
 * details, selected parameters, next visit date, disclaimer page and all
 * formatting/styling).
 *
 * Browsers do not expose a "print to file" API, so the most accurate way to
 * produce a PDF that matches the report is the native print flow: the report is
 * opened in a dedicated window and the browser's "Save as PDF" destination is
 * invoked. This keeps all @page / print CSS from the compiled report intact.
 */

/**
 * Opens the given compiled report HTML in a print window and triggers the
 * browser's native print dialog so the user can save the report as an A4 PDF.
 *
 * @param {string} reportHtml - Full compiled report HTML (from generate-pdf).
 * @param {string} docTitle   - Suggested document title (used as PDF filename).
 * @returns {Window|null}     - The opened window, or null if blocked / empty.
 */
export function openReportForPdfSave(
    reportHtml,
    docTitle = "Quantum-Health-Report"
) {
    if (!reportHtml) return null;

    const win = window.open("", "_blank");
    if (!win) return null;

    win.document.open();
    win.document.write(reportHtml);
    win.document.close();
    win.document.title = docTitle;

    let printed = false;

    // Print-friendly fallback styles (the compiled report ships its own @page CSS;
    // this only guarantees A4 + no extra margins if anything is missing).
    const injectPrintStyles = () => {
        try {
            const style = win.document.createElement("style");
            style.innerHTML = `@page { size: A4; margin: 10mm 12mm 12mm 12mm; } html, body { margin: 0 !important; padding: 0 !important; background: #ffffff !important; }`;
            win.document.head && win.document.head.appendChild(style);
        } catch (e) {
            // ignore — the report already contains its own print styles
        }
    };

    const schedulePrint = () => {
        if (printed || win.closed) return;
        printed = true;
        injectPrintStyles();
        // Let the print window focus, then open the print / "Save as PDF" dialog.
        setTimeout(() => {
            if (win.closed) return;
            win.focus();
            win.print();
        }, 250);
    };

    win.focus();
    // Give the window a moment to render the report and load the logo image,
    // then open the print dialog (browser's "Save as PDF" flow).
    if (win.document.readyState === "complete") {
        setTimeout(schedulePrint, 500);
    } else {
        win.addEventListener("load", schedulePrint, { once: true });
    }

    return win;
}

/**
 * Best-supported WhatsApp sharing flow for the report PDF:
 *
 * 1. Generates + saves the complete PDF (same HTML / function as Download PDF).
 * 2. Opens WhatsApp with the predefined message (message preserved from backend).
 * 3. The user can then attach the saved PDF and send it along with the message.
 *
 * @param {object} options
 * @param {string} options.reportHtml - Compiled report HTML (single source of truth).
 * @param {string} [options.docTitle] - Suggested PDF document title.
 * @param {() => Promise<string>} options.getWhatsAppUrl
 *   Resolves the predefined WhatsApp URL (wa.me + encoded message).
 *
 * @returns {Promise<boolean>} true when the flow started, false when a popup
 *   was blocked (the caller should surface a "allow popups" message).
 * @throws {Error} when getWhatsAppUrl fails (caller shows a generic error).
 */
export async function prepareWhatsAppPdfShare({
    reportHtml,
    docTitle = "Quantum-Health-Report",
    getWhatsAppUrl,
}) {
    // Pre-open the WhatsApp window synchronously (same user gesture as the PDF
    // window) to satisfy popup blockers, then navigate it once the URL resolves.
    const waWin = window.open("", "_blank");

    const pdfWin = openReportForPdfSave(reportHtml, docTitle);
    if (!pdfWin) {
        if (waWin) waWin.close();
        return false;
    }

    let waUrl;
    try {
        waUrl = await getWhatsAppUrl();
    } catch (err) {
        if (waWin) waWin.close();
        throw err;
    }

    if (waWin) {
        waWin.location.href = waUrl;
    } else {
        window.open(waUrl, "_blank");
    }

    return true;
}
