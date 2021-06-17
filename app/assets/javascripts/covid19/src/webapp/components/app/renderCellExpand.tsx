import * as React from "react";
import { Box, Link, Paper, Popover, Typography } from "@material-ui/core";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import { GridCellParams, isOverflown } from "@material-ui/data-grid";

interface CellExpandProps {
    description: string;
    authors: string[];
    released: string;
    width: number;
}

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            alignItems: "center",
            lineHeight: "24px",
            width: "100%",
            height: "100%",
            position: "relative",
            display: "flex",
            "& .cellValue": {
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
            },
        },
    })
);

const CellExpand = React.memo(function CellExpand(props: CellExpandProps) {
    const { description, authors, released, width } = props;
    const classes = useStyles();
    const wrapper = React.useRef<HTMLDivElement | null>(null);
    const cellValueRef = React.useRef(null);
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    const [isCurrentlyOverflown, setCurrentlyOverflown] = React.useState<null | Boolean>(null);

    React.useEffect(() => {
        setCurrentlyOverflown(isOverflown(cellValueRef.current!));
    }, [isCurrentlyOverflown, description, authors, released]);

    const handleClick = (event: any) => {
        setAnchorEl(event.currentTarget);
        return;
    };

    const handleClose = () => {
        setAnchorEl(null);
    };
    const open = Boolean(anchorEl);
    return (
        <div ref={wrapper} className={classes.root}>
            <div ref={cellValueRef} className="cellValue">
                {description}
            </div>
            {isCurrentlyOverflown && (
                <>
                    <Link href="/#" onClick={handleClick}>
                        Show All
                    </Link>
                    <Popover
                        open={open}
                        anchorEl={anchorEl}
                        onClose={handleClose}
                        anchorOrigin={{
                            vertical: "bottom",
                            horizontal: "center",
                        }}
                        transformOrigin={{
                            vertical: "top",
                            horizontal: "center",
                        }}
                    >
                        <Paper elevation={1}>
                            <Box width={width} p={2}>
                                <Typography variant="body2"> Description: {description}</Typography>
                                <Typography variant="body2">Authors: hello</Typography>
                                <Typography variant="body2">Released: {released}</Typography>
                            </Box>
                        </Paper>
                    </Popover>
                </>
            )}
        </div>
    );
});

export function renderCellExpand(params: GridCellParams) {
    return (
        <CellExpand
            description={params.row.details.description ? params.row.details.description.toString() : ""}
            authors={params.row.details.authors ? (params.row.details.authors as string[]) : []}
            released={params.row.details.released ? params.row.details.released.toString() : ""}
            width={params.colDef.width}
        />
    );
}
