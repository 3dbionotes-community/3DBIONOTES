import _ from "lodash";
import React from "react";
import { Category as CategoryIcon } from "@material-ui/icons";
import { Dropdown, DropdownProps } from "../dropdown/Dropdown";
import { Profile, ProfileId, profiles } from "../../../domain/entities/Profile";
import { sendAnalytics } from "../../utils/analytics";
import i18n from "../../utils/i18n";

export interface ProfilesButtonProps {
    profile: Profile;
    onChange(newProfile: Profile): void;
    expanded: boolean;
}

export const ProfilesButton: React.FC<ProfilesButtonProps> = React.memo(props => {
    const { profile, onChange, expanded } = props;
    const dropdownItems: DropdownProps<ProfileId>["items"] = React.useMemo(() => {
        return _.values(profiles).map(profile => {
            return { text: profile.name, id: profile.id };
        });
    }, []);

    const setProfile = React.useCallback(
        (profileId: ProfileId) => {
            sendAnalytics("set_profile", {
                on: "viewer",
                label: profileId,
            });
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
            leftIcon={<CategoryIcon fontSize="small" />}
            expanded={expanded}
        />
    );
});
