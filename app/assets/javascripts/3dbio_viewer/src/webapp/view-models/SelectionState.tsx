export type Type = "pdb" | "emdb";

export interface SelectionState {
    main: { pdbId: string; emdbId?: string };
    overlay: Array<{
        type: Type;
        id: string;
        visible: boolean;
    }>;
}
