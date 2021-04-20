import i18n from "d2-ui-components/locales";

const i18nWrapper = {
    t(s: string, namespace?: object): string {
        return i18n.t(s, namespace);
    },
};

export default i18nWrapper;
