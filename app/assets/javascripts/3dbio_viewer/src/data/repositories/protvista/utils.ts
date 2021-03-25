export function getName(s: string | undefined) {
    return (s || "").replace(/_/g, " ");
}

export function getId(name: string): string {
    return name
        .replace("&", "and")
        .replace(/[^\w]+/g, "-")
        .toLowerCase();
}
