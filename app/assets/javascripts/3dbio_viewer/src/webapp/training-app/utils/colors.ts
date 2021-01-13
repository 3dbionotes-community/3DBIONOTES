type Dictionary<T> = Record<string, T>;

type Color = "primary" | "secondary" | "default" | "inherit";
type ColorPalette = "main" | "light" | "dark";

const theme: Dictionary<Dictionary<string>> = {
    main: {
        primary: "#43CBCB",
        secondary: "#ff8f02",
    },
    light: {
        primary: "#7efffe",
        secondary: "#ffc046",
    },
    dark: {
        primary: "#009a9a",
        secondary: "#c56000",
    },
};

export const getColor = (color: Color, palette: ColorPalette = "main") => {
    return theme[palette][color] ?? theme.main.primary;
};
