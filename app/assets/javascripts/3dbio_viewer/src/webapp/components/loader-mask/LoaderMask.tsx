import React from "react";
import { Backdrop, CircularProgress } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

interface LoaderProps {
    open: boolean;
    title?: string;
}

export const LoaderMask: React.FC<LoaderProps> = React.memo(props => {
    const classes = useStyles();
    const { open, title } = props;

    return (
        <Backdrop className={classes.backdrop} open={open}>
            <CircularProgress />
            {title && <div>{title}</div>}
        </Backdrop>
    );
});

const useStyles = makeStyles(theme => ({
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: "#fff",
    },
}));
