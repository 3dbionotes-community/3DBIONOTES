import React, { DOMAttributes } from "react";
import _ from "lodash";
import { DataGridProps, GridApi } from "@material-ui/data-grid";

export interface VirtualScrollbarProps {
    displayInfo?: DisplayInfo;
    onScrollLeftChange(value: number): void;
}

export interface DisplayInfo {
    width: number;
    scrollPos: number;
}

export const VirtualScroll: React.FC<VirtualScrollbarProps> = React.memo(props => {
    const { displayInfo, onScrollLeftChange } = props;
    const offsetWidth = displayInfo?.width || 0;
    const scrollLeft = displayInfo?.scrollPos || 0;

    const sliderInnerStyle = React.useMemo(() => {
        return { ...styles.inner, width: offsetWidth };
    }, [offsetWidth]);

    const slideRef = React.useRef<HTMLDivElement>(null);

    const scrollLeftRef = React.useRef<number>(0);

    React.useEffect(() => {
        const el = slideRef.current;
        if (el) {
            el.scrollLeft = scrollLeft;
            scrollLeftRef.current = scrollLeft;
        }
    }, [scrollLeft]);

    const notifyScroll = React.useCallback<NonNullable<DOMAttributes<HTMLDivElement>["onScroll"]>>(
        ev => {
            const el = ev.currentTarget;
            if (scrollLeftRef.current !== el.scrollLeft) onScrollLeftChange(el.scrollLeft);
        },
        [onScrollLeftChange]
    );

    return (
        <div ref={slideRef} style={styles.parent} onScroll={notifyScroll}>
            <div style={sliderInnerStyle}></div>
        </div>
    );
});

export const styles = {
    parent: { width: "100%", overflowX: "auto" as const, overflowY: "hidden" as const },
    inner: { display: "inline-block" },
};

export function useVirtualScrollbarForDataGrid() {
    const gridApi = React.useRef<GridApi>();

    const [displayInfo, setDisplayInfo] = React.useState<DisplayInfo>();

    const updateScrollBarFromStateChange = React.useCallback<
        NonNullable<DataGridProps["onStateChange"]>
    >(params => {
        const api = params.api as GridApi;
        gridApi.current = api;
        const gridWindow = api.windowRef?.current;
        const innerDiv = gridWindow?.querySelector<HTMLDivElement>(".data-container");
        if (!gridWindow || !innerDiv) return;

        const newInfo: DisplayInfo = {
            width: innerDiv.offsetWidth,
            scrollPos: gridWindow.scrollLeft,
        };
        setDisplayInfo(prevInfo => (_.isEqual(newInfo, prevInfo) ? prevInfo : newInfo));
    }, []);

    const onScrollLeftChange = React.useCallback((scrollLeft: number) => {
        const api = gridApi.current;
        if (api && api.windowRef && api.windowRef.current) {
            api.windowRef.current.scrollLeft = scrollLeft;
        }
    }, []);

    const virtualScrollbarProps: VirtualScrollbarProps = React.useMemo(
        () => ({ displayInfo, onScrollLeftChange }),
        [displayInfo, onScrollLeftChange]
    );

    return { virtualScrollbarProps, updateScrollBarFromStateChange };
}
