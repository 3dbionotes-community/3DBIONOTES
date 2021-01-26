type Dictionary<T> = Record<string, T>;

type Color = "primary" | "secondary" | "default" | "inherit";
type ColorPalette = "main" | "light" | "dark";

const theme: Dictionary<Dictionary<string>> = {
    main: {
        primary: "#fff",
        secondary: "#93d2f1",
    },
    light: {
        primary: "#7efffe",
        secondary: "#ffc046",
    },
    dark: {
        primary: "#93d2f1",
        secondary: "#fff",
    },
};

export const getColor = (color: Color, palette: ColorPalette = "main") => {
    return theme[palette]?.[color] ?? theme.main?.primary;
};
