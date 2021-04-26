import _ from "lodash";
import {
    fromPairs,
    GetRecordId,
    GetValue,
    idRecordOf,
    isElementOfUnion,
    Maybe,
} from "../../utils/ts-utils";
import i18n from "../utils/i18n";

export const profiles = idRecordOf<{ name: string; code: string }>()({
    general: { name: i18n.t("General"), code: "general" as const },
    structural: { name: i18n.t("Structural"), code: "structural" as const },
    validation: { name: i18n.t("Cryo-Em Quality Validation"), code: "validation" as const },
    drugDesign: { name: i18n.t("Drug Design"), code: "drug-design" as const },
    biomedicine: { name: i18n.t("Biomedicine"), code: "biomedicine" as const },
    omics: { name: i18n.t("Omics"), code: "omics" as const },
});

const profileCodes = _.values(profiles).map(profile => profile.code);

const profileByCode = fromPairs(_.values(profiles).map(profile => [profile.code, profile]));

export type Profile = GetValue<typeof profiles>;

export type ProfileId = GetRecordId<typeof profiles>;

export function getProfileFromString(profileCode: Maybe<string>) {
    return profileCode !== undefined && isElementOfUnion(profileCode, profileCodes)
        ? profileByCode[profileCode]
        : profiles.general;
}

export function getStringFromProfile(profile: Profile): Maybe<string> {
    return profile === profiles.general ? undefined : profile.code;
}
