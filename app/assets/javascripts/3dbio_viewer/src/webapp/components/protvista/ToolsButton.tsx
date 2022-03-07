import React from "react";
import i18n from "../../utils/i18n";
import { Dropdown, DropdownProps } from "../dropdown/Dropdown";
import { Network } from "../network/Network";
import { useBooleanState } from "../../hooks/use-boolean";
import { AnnotationsTool } from "../annotations-tool/AnnotationsTool";
import { Annotations } from "../../../domain/entities/Annotation";

export interface ToolsButtonProps {
    onAddAnnotations(annotations: Annotations): void;
}

type ItemId = "custom-annotations" | "network";

type Props = DropdownProps<ItemId>;

export const ToolsButton: React.FC<ToolsButtonProps> = props => {
    const { onAddAnnotations } = props;

    const [isNetworkOpen, networkActions] = useBooleanState(false);
    const [isAnnotationToolOpen, annotationToolActions] = useBooleanState(false);

    const items = React.useMemo<Props["items"]>(() => {
        return [
            { text: i18n.t("Upload custom annotations"), id: "custom-annotations" },
            { text: i18n.t("Network"), id: "network" },
        ];
    }, []);

    const openMenuItem = React.useCallback<Props["onClick"]>(
        itemId => {
            switch (itemId) {
                case "custom-annotations":
                    return annotationToolActions.open();
                case "network":
                    return networkActions.open();
            }
        },
        [annotationToolActions, networkActions]
    );

    return (
        <>
            <Dropdown<ItemId> text={i18n.t("Tools")} items={items} onClick={openMenuItem} />

            {isNetworkOpen && <Network onClose={networkActions.close} />}

            {isAnnotationToolOpen && (
                <AnnotationsTool onClose={annotationToolActions.close} onAdd={onAddAnnotations} />
            )}
        </>
    );
};
