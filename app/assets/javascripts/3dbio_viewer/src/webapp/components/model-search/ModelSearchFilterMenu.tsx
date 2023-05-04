import React from "react";
import i18n from "../../utils/i18n";
import { FilterList as FilterListIcon } from "@material-ui/icons";
import { MenuItem, MenuList, Checkbox } from "@material-ui/core";
import { GridMenu } from "@material-ui/data-grid";
import styled from "styled-components";
import { StyledButton } from "../../training-app/components/action-button/ActionButton";

export const modelTypeKeys = ["emdb", "pdb"] as const;

type ModelTypeKey = typeof modelTypeKeys[number];

export type ModelTypeFilter = Record<ModelTypeKey, boolean>;

export const ModelSearchFilterMenu: React.FC<{
    modelTypeState: ModelTypeFilter;
    setModelTypeState(filter: ModelTypeFilter): void;
}> = React.memo(props => {
    const { modelTypeState, setModelTypeState } = props;
    const [anchorEl, setAnchorEl] = React.useState(null);
    const isOpen = Boolean(anchorEl);
    const openMenu = React.useCallback(event => setAnchorEl(event.currentTarget), []);
    const closeMenu = React.useCallback(() => setAnchorEl(null), []);
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setModelTypeState({
            ...modelTypeState,
            [event.target.name]: event.target.checked,
        });
    };
    const handleClick = (modelType: string) => (
        _event: React.MouseEvent<HTMLLIElement, MouseEvent>
    ) => {
        setModelTypeState({
            ...modelTypeState,
            [modelType]: !modelTypeState[modelType as ModelTypeKey],
        });
    };

    return (
        <React.Fragment>
            <StyledButton className="model-search" onClick={openMenu}>
                {i18n.t("Filter")}
                <FilterListIcon fontSize="small" />
            </StyledButton>
            <GridMenu
                open={isOpen}
                target={anchorEl}
                onClickAway={closeMenu}
                position="bottom-start"
            >
                <MenuList className="MuiDataGrid-gridMenuList" autoFocusItem={isOpen}>
                    <MenuItem id="emdb" onClick={handleClick("emdb")}>
                        <StyledCheckbox
                            name="emdb"
                            checked={modelTypeState.emdb}
                            onChange={handleChange}
                        />
                        {i18n.t("EMDB")}
                    </MenuItem>
                    <MenuItem id="pdb" onClick={handleClick("pdb")}>
                        <StyledCheckbox
                            name="pdb"
                            checked={modelTypeState.pdb}
                            onChange={handleChange}
                        />
                        {i18n.t("PDB")}
                    </MenuItem>
                </MenuList>
            </GridMenu>
        </React.Fragment>
    );
});

const StyledCheckbox = styled(Checkbox)`
    &.MuiCheckbox-colorSecondary.Mui-checked {
        color: grey;
    }
`;
