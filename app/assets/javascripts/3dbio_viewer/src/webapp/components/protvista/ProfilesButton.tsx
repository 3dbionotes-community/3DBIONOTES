import React from "react";
import _ from "lodash";
import i18n from "../../utils/i18n";
import { Dropdown, DropdownProps } from "../dropdown/Dropdown";
import { Profile, ProfileId, profiles } from "./protvista-blocks";

export interface ProfilesButtonProps {
    profile: Profile;
    onChange(newProfile: Profile): void;
}

export const ProfilesButton: React.FC<ProfilesButtonProps> = props => {
    const { profile, onChange } = props;

    const dropdownItems: DropdownProps<ProfileId>["items"] = React.useMemo(() => {
        return _.values(profiles).map(profile => {
            return { text: profile.name, id: profile.id };
        });
    }, []);

    const setProfile = React.useCallback(
        (profileId: ProfileId) => {
            onChange(profiles[profileId]);
        },
        [onChange]
    );

    return (
        <Dropdown<ProfileId>
            text={i18n.t("Profiles")}
            selected={profile.id}
            items={dropdownItems}
            onClick={setProfile}
            showSelection={true}
        />
    );
};
