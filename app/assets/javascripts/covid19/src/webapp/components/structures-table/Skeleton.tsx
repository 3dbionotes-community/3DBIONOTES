import _ from "lodash";
import React from "react";
import { Box } from "@material-ui/core";
import { Skeleton as MuiSkeleton } from "@material-ui/lab";
import { headerHeight, rowHeight } from "./StructuresTable";
import { columnsWidths } from "./Columns";

const columns = columnsWidths;

export const Skeleton: React.FC = () => (
    <Box top={headerHeight} height={rowHeight} width="100%" position="absolute">
        <Box display="flex" height={rowHeight} width="100%" alignItems="center">
            <TitleSkeleton />
            <PdbSkeleton />
            <EmdbSkeleton />
            <RelatedSkeleton />
            <RelatedSkeleton />
            <RelatedSkeleton />
            <DetailsSkeleton />
        </Box>
        <Box display="flex" height={rowHeight} width="100%" alignItems="center">
            <TitleSkeleton />
            <PdbSkeleton />
            <EmdbSkeleton />
            <RelatedSkeleton />
            <RelatedSkeleton />
            <RelatedSkeleton />
            <DetailsSkeleton />
        </Box>
    </Box>
);

const TitleSkeleton: React.FC = () => (
    <Box
        display="flex"
        flexDirection="column"
        paddingX={2}
        width={columns.title}
        boxSizing="border-box"
    >
        <MuiSkeleton animation="wave" variant="text" width={columns.title - 32} />
        <MuiSkeleton animation="wave" variant="text" width={(columns.title - 32) * 0.75} />
    </Box>
);

const PdbSkeleton: React.FC = () => (
    <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        paddingX={2}
        gridRowGap={16}
        width={columns.pdb}
        boxSizing="border-box"
    >
        <MuiSkeleton animation="wave" variant="rect" width={100} height={100} style={styles.rect} />
        <MuiSkeleton animation="wave" variant="text" width="10ch" />
        <MuiSkeleton
            animation="wave"
            variant="rect"
            width={60}
            height="1.5em"
            style={styles.rect}
        />
    </Box>
);

const EmdbSkeleton: React.FC = () => (
    <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        paddingX={2}
        gridRowGap={16}
        width={columns.emdb}
        boxSizing="border-box"
    >
        <MuiSkeleton animation="wave" variant="rect" width={100} height={100} style={styles.rect} />
        <MuiSkeleton animation="wave" variant="text" width="10ch" />
        <MuiSkeleton
            animation="wave"
            variant="rect"
            width={60}
            height="1.5em"
            style={styles.rect}
        />
    </Box>
);

const RelatedSkeleton: React.FC = () => (
    <Box
        display="flex"
        flexDirection="column"
        paddingLeft={4}
        paddingRight={2}
        width={columns.related}
        boxSizing="border-box"
    >
        <MuiSkeleton animation="wave" variant="text" width={columns.related - 48} />
        <MuiSkeleton animation="wave" variant="text" width={columns.related - 48} />
        <MuiSkeleton animation="wave" variant="text" width={(columns.related - 48) * 0.25} />
    </Box>
);

const DetailsSkeleton: React.FC = () => {
    return (
        <Box
            display="flex"
            flexDirection="column"
            paddingLeft={4}
            paddingRight={2}
            boxSizing="border-box"
            flexGrow={1}
        >
            <MuiSkeleton animation="wave" variant="text" width={150} />
            <MuiSkeleton animation="wave" variant="text" />
            <MuiSkeleton animation="wave" variant="text" width={200} />
            <MuiSkeleton animation="wave" variant="text" width={100} />
            <Box
                display="flex"
                flexDirection="column"
                paddingLeft={4}
                boxSizing="border-box"
                flexGrow={1}
            >
                <MuiSkeleton animation="wave" variant="text" width={200} />
                <MuiSkeleton animation="wave" variant="text" width={100} />
            </Box>
        </Box>
    );
};

const styles = {
    details: { container: { flexGrow: 1 } },
    rect: { borderRadius: "0.25em" },
};
