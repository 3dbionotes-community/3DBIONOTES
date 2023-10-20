export function downloadFile(options: { filename: string; data: string; mimeType: string }): void {
    const { filename, data, mimeType } = options;
    const blob = new Blob([data], { type: mimeType });
    const element =
        document.querySelector<HTMLAnchorElement>("#download") || document.createElement("a");
    element.id = "download-file";
    element.href = window.URL.createObjectURL(blob);
    element.setAttribute("download", filename);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
}

export function downloadBlob(options: { blob: Blob; filename: string }): void {
    const { filename, blob } = options;
    const element =
        document.querySelector<HTMLAnchorElement>("#download") || document.createElement("a");
    element.id = "download-file";
    element.href = window.URL.createObjectURL(blob);
    element.setAttribute("download", filename);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
}
