export const shapeTypes = [
    "rectangle",
    "bridge",
    "diamond",
    "chevron",
    "catFace",
    "triangle",
    "wave",
    "hexagon",
    "pentagon",
    "circle",
    "arrow",
    "doubleBar",
    "variant",
] as const;

export type Shape = typeof shapeTypes[number];
