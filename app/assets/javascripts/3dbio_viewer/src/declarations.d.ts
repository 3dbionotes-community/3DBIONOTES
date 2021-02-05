declare namespace JSX {
    interface IntrinsicElements {
        "protvista-pdb": ProtvistaPdbWebComponent;
    }
}

declare interface ProtvistaPdbWebComponent {
    "custom-data"?: "true";
    ref: React.RefObject<ProtvistaTrackElement>;
}
