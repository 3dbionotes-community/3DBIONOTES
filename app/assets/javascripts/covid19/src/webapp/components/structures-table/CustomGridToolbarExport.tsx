import React from "react";
import _ from "lodash";
import { Button, MenuItem, MenuList } from "@material-ui/core";
import { GridMenu } from "@material-ui/data-grid";
import i18n from "../../../utils/i18n";
import { useAppContext } from "../../contexts/app-context";
import { DataGrid } from "../../../domain/entities/DataGrid";

export interface CustomGridToolbarExportProps {
    dataGrid: DataGrid;
}

export const CustomGridToolbarExport: React.FC<CustomGridToolbarExportProps> = React.memo(props => {
    const { compositionRoot } = useAppContext();
    const { dataGrid } = props;
    const [anchorEl, setAnchorEl] = React.useState(null);
    const openMenu = React.useCallback(event => setAnchorEl(event.currentTarget), []);
    const handleMenuClose = React.useCallback(() => setAnchorEl(null), []);

    const exportToCsv = React.useCallback(() => {
        compositionRoot.exportStructures.execute({ dataGrid, format: "csv" });
    }, [compositionRoot, dataGrid]);

    const exportToJson = React.useCallback(() => {
        compositionRoot.exportStructures.execute({ dataGrid, format: "json" });
    }, [compositionRoot, dataGrid]);

    const startIcon = React.useMemo(() => <ExportIcon />, []);
    const isOpen = Boolean(anchorEl);

    return (
        <React.Fragment>
            <Button
                color="primary"
                size="small"
                onClick={openMenu}
                aria-expanded={Boolean(anchorEl)}
                aria-label="toolbarExportLabel"
                aria-haspopup="menu"
                startIcon={startIcon}
            >
                {i18n.t("Export")}
            </Button>

            <GridMenu
                open={isOpen}
                target={anchorEl}
                onClickAway={handleMenuClose}
                position="bottom-start"
            >
                <MenuList className="MuiDataGrid-gridMenuList" autoFocusItem={isOpen}>
                    <MenuItem onClick={exportToCsv}>{i18n.t("Save as CSV")}</MenuItem>
                    <MenuItem onClick={exportToJson}>{i18n.t("Save as JSON")}</MenuItem>
                </MenuList>
            </GridMenu>
        </React.Fragment>
    );
});

const ExportIcon: React.FC = React.memo(() => (
    <svg className="MuiSvgIcon-root" focusable="false" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2z"></path>
    </svg>
));
