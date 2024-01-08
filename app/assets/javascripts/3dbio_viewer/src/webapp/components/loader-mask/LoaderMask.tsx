import React from "react";
import { Backdrop, CircularProgress, makeStyles } from "@material-ui/core";
import { Cancel as CancelIcon } from "@material-ui/icons";
import styled from "styled-components";
import { isDev } from "../../../routes";

interface LoaderProps {
    open: boolean;
    title?: string;
    errorThrown?: boolean;
}

export const LoaderMask: React.FC<LoaderProps> = React.memo(props => {
    const classes = useStyles();
    const { open, title, errorThrown } = props;

    return (
        <Backdrop className={classes.backdrop} open={open}>
            <Container>
                {errorThrown ? <CancelIcon fontSize="large" color="error" /> : <CircularProgress />}
                {title && <p className={classes.title}>{title}</p>}
            </Container>
        </Backdrop>
    );
});

const useStyles = makeStyles(theme => ({
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: "#fff",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
    },
    title: {
        fontWeight: "bold",
        fontSize: "1em",
        marginTop: "1em",
    },
}));

const Container = styled.div`
    & {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    & .MuiCircularProgress-colorPrimary {
        color: #fff !important;
    }
`;
