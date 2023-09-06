import React from "react";
import i18n from "../../utils/i18n";
import { Dropdown, DropdownProps } from "../dropdown/Dropdown";
import { useBooleanState } from "../../hooks/use-boolean";
import { AnnotationsTool } from "../annotations-tool/AnnotationsTool";
import { Annotations } from "../../../domain/entities/Annotation";
import { Build as BuildIcon } from "@material-ui/icons";
import { useAppContext } from "../AppContext";
import { Pdb } from "../../../domain/entities/Pdb";
import { LoaderKey } from "../RootViewerContents";

export interface ToolsButtonProps {
    onAddAnnotations(annotations: Annotations): void;
    expanded: boolean;
    pdb: Pdb;
    updateLoader: <T>(key: LoaderKey, promise: Promise<T>, message?: string) => Promise<T>;
}

type ItemId = "custom-annotations" | "network" | "download-annotations";

type Props = DropdownProps<ItemId>;

export const ToolsButton: React.FC<ToolsButtonProps> = props => {
    const { onAddAnnotations, expanded, pdb, updateLoader } = props;
    const [isAnnotationToolOpen, annotationToolActions] = useBooleanState(false);
    const { compositionRoot } = useAppContext();

    const items = React.useMemo<Props["items"]>(() => {
        return [
            { text: i18n.t("Upload custom annotations"), id: "custom-annotations" },
            { text: i18n.t("Download annotations (sources)"), id: "download-annotations" },
        ];
    }, []);

    const openMenuItem = React.useCallback<Props["onClick"]>(
        itemId => {
            const { protein, id, chainId, emdbs } = pdb;
            switch (itemId) {
                case "custom-annotations":
                    return annotationToolActions.open();
                case "download-annotations":
                    return updateLoader(
                        "exportAnnotations",
                        compositionRoot.exportAllAnnotations
                            .execute({ proteinId: protein.id, pdbId: id, chainId, emdbs })
                            .toPromise()
                    );
            }
        },
        [annotationToolActions, compositionRoot.exportAllAnnotations, pdb, updateLoader]
    );

    return (
        <>
            <Dropdown<ItemId>
                text={(expanded && i18n.t("Tools")) || undefined}
                items={items}
                onClick={openMenuItem}
                leftIcon={<BuildIcon fontSize="small" />}
            />

            {isAnnotationToolOpen && (
                <AnnotationsTool onClose={annotationToolActions.close} onAdd={onAddAnnotations} />
            )}
        </>
    );
};
