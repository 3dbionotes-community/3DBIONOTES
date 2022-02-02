import React from "react";
import _ from "lodash";
import i18n from "../../utils/i18n";
import { Dropdown, DropdownProps } from "../dropdown/Dropdown";
import { Profile, ProfileId, profiles } from "../../../domain/entities/Profile";
import { sendAnalytics } from "../../utils/analytics";

export interface ProfilesButtonProps {
    profile: Profile;
    onChange(newProfile: Profile): void;
}

export const ProfilesButton: React.FC<ProfilesButtonProps> = React.memo(props => {
    const { profile, onChange } = props;

    const dropdownItems: DropdownProps<ProfileId>["items"] = React.useMemo(() => {
        return _.values(profiles).map(profile => {
            return { text: profile.name, id: profile.id };
        });
    }, []);

    const setProfile = React.useCallback(
        (profileId: ProfileId) => {
            sendAnalytics({ type: "event", category: "profile", action: profileId });
            onChange(profiles[profileId]);
        },
        [onChange]
    );

    const text = i18n.t("Profile") + ": " + profile.name;

    return (
        <Dropdown<ProfileId>
            text={text}
            selected={profile.id}
            items={dropdownItems}
            onClick={setProfile}
            showSelection={true}
        />
    );
});
