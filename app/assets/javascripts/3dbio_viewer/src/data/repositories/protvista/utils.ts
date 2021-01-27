export function getName(s: string) {
    return s.replace(/_/g, " ");
}

export function getId(name: string): string {
    return name
        .replace("&", "and")
        .replace(/[^\w]+/g, "-")
        .toLowerCase();
}
