import React from "react";
import i18n from "../../utils/i18n";
import { Backdrop, CircularProgress } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: "#fff",
    },
}));

interface LoaderProps {
    open: boolean;
}

export const UploadLoader: React.FC<LoaderProps> = React.memo(props => {
    const classes = useStyles();
    const { open } = props;
    return (
        <Backdrop className={classes.backdrop} open={open}>
            <CircularProgress />
            <div>{i18n.t("Uploading Atomic Structure...")}</div>
        </Backdrop>
    );
});
