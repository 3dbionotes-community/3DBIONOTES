// @ts-nocheck TODO
import React from "react";
import { Button, MenuItem, MenuList } from "@material-ui/core";
import { GridMenu } from "@material-ui/data-grid";
import i18n from "../../../utils/i18n";

export interface CustomGridToolbarExportProps {
    columns: unknown;
}

export const CustomGridToolbarExport: React.FC = React.memo(props => {
    const { columns } = props;
    const [anchorEl, setAnchorEl] = React.useState(null);
    const handleMenuOpen = (event: any) => setAnchorEl(event.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);

    const exportToCsv = React.useCallback(() => {
        const visibleColumns = columns.filter(column => column.hide === false).map(x => x.field);
        const userRows = getRenderedRowsWithVisibleColumnsCsv();
        const table = [visibleColumns, ...userRows];
        const parsedTable = Papa.unparse(table);
        const blob = new Blob([parsedTable], { type: "text/plain;charset=utf-8" });
        const datetime = moment().format("YYYY-MM-DD_HH-mm-ss");
        const filename = `${protein.name}-${datetime}.csv`;
        FileSaver.saveAs(blob, filename);
    }, []);

    return (
        <React.Fragment>
            <Button
                color="primary"
                size="small"
                onClick={handleMenuOpen}
                aria-expanded={anchorEl ? "true" : undefined}
                aria-label="toolbarExportLabel"
                aria-haspopup="menu"
                startIcon={<ExportIcon />}
            >
                toolbarExport
            </Button>

            <GridMenu
                open={Boolean(anchorEl)}
                target={anchorEl}
                onClickAway={handleMenuClose}
                position="bottom-start"
            >
                <MenuList className="MuiDataGrid-gridMenuList" autoFocusItem={Boolean(anchorEl)}>
                    <MenuItem onClick={exportToCsv}>{i18n.t("Export to CSV")}</MenuItem>
                    <MenuItem>
                        <DownloadJsonLink />
                    </MenuItem>
                </MenuList>
            </GridMenu>
        </React.Fragment>
    );
});

const DownloadJsonLink: React.FC = React.memo(() => {
    const rowsWithVisibleColumns = getRenderedRowsWithVisibleColumns();

    return (
        <a
            style={styles.link}
            href={`data:text/json;charset=utf-8,${encodeURIComponent(
                JSON.stringify(rowsWithVisibleColumns)
            )}`}
            download={`covid19.json`}
        >
            {i18n.t("Export as JSON")}
        </a>
    );
});

const ExportIcon: React.FC = React.memo(() => (
    <svg className="MuiSvgIcon-root" focusable="false" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2z"></path>
    </svg>
));

const styles = {
    link: { textDecoration: "none", color: "black" },
};
