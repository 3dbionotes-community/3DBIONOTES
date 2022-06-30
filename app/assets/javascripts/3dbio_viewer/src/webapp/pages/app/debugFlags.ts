export const debugFlags = {
    hideTraining: env("HIDE_TRAINING"),
    showOnlyValidations: env("SHOW_ONLY_VALIDATIONS"),
};

function env(name: string, defaultValue = false): boolean {
    const value = process.env["REACT_APP_" + name];

    if (value) {
        return ["1", "true", "yes", "on"].includes(value);
    } else {
        return defaultValue;
    }
}
