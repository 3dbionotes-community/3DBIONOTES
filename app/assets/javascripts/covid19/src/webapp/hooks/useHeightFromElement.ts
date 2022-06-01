import React, { useState, useRef, useEffect } from "react";

export function useHeightFromElement<Element extends HTMLElement>(): {
    ref: React.MutableRefObject<Element | null>;
    height: number;
} {
    const [height, setHeight] = useState(0);
    const ref = useRef<Element>(null);
    useEffect(() => {
        setHeight(ref.current?.getBoundingClientRect().height ?? 0);
    }, []);
    return { ref, height };
}
