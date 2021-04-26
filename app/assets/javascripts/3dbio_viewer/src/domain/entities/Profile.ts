import { getKeys, GetRecordId, GetValue, idRecordOf, isElementOfUnion, Maybe } from "../../utils/ts-utils";
import i18n from "../utils/i18n";

export const profiles = idRecordOf<{ name: string }>()({
    general: { name: i18n.t("General") },
    structural: { name: i18n.t("Structural") },
    validation: { name: i18n.t("Cryo-Em Quality Validation") },
    drugDesign: { name: i18n.t("Drug Design") },
    biomedicine: { name: i18n.t("Biomedicine") },
    omics: { name: i18n.t("Omics") },
});

const profileIds = getKeys(profiles);

export type Profile = GetValue<typeof profiles>;

export type ProfileId = GetRecordId<typeof profiles>;

export function getProfileFromString(s: Maybe<string>) {
    return s && isElementOfUnion(s, profileIds) ? profiles[s] : profiles.general;
}

export function getStringFromProfile(profile: Profile): Maybe<string> {
    return profile === profiles.general ? undefined : profile.id;
}
