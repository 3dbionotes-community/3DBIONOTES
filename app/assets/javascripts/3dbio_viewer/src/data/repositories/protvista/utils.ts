import _ from "lodash";

export function getName(s: string | undefined) {
    return _.startCase(s || "");
}

export function getId(name: string): string {
    return name
        .replace("&", "and")
        .replace(/[^\w]+/g, "-")
        .toLowerCase();
}

export interface Item {
    name: string | undefined;
    values: Array<string | undefined> | undefined;
}

export function getStringFromItems(items: Item[]): string {
    return _(items)
        .map(item =>
            item.values && !_.isEmpty(item.values)
                ? _.compact([
                      item.name ? `<b style="color: grey">${item.name}:</b>` : undefined,
                      item.name ? item.values.join(", ") : `<b>${item.values.join(", ")}</b>`,
                  ]).join(" ")
                : null
        )
        .compact()
        .join("<br/>");
}

export function bold(s: string) {
    return `<b>${s}</b>`;
}

export const lineBreak = `<br>`;
