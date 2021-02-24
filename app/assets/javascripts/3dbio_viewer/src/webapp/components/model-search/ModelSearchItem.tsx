import { withStyles, Tooltip } from "@material-ui/core";
import classnames from "classnames";
import React from "react";
import ReactImageFallback from "react-image-fallback";
import { DbModel } from "../../../domain/entities/DbModel";
import { useBooleanState } from "../../hooks/use-boolean";
import { useDebounce } from "../../hooks/use-debounce";
import i18n from "../../utils/i18n";
import { Link } from "../Link";
import { ModelSearchProps } from "./ModelSearch";

export const ModelSearchItem: React.FC<{
    item: DbModel;
    onSelect: ModelSearchProps["onSelect"];
}> = React.memo(props => {
    const { item, onSelect } = props;
    const [isMouseOver, { enable: setOver, disable: unsetOver }] = useBooleanState(false);
    const debounceMs = 50;
    const setMouseOverD = useDebounce(setOver, debounceMs);
    const unsetMouseOverD = useDebounce(unsetOver, debounceMs);
    const className = classnames("item", isMouseOver ? "hover" : null);
    const selectModel = React.useCallback(() => onSelect("select", item), [onSelect, item]);
    const appendModel = React.useCallback(() => onSelect("append", item), [onSelect, item]);

    // Img src may not exist, show it pretty
    // Can we filter by score? to make smarted requests
    // query=*.* returns irrelevant models. Can we sort by some relevance (mapReleaseDate?)

    const description = (
        <React.Fragment>
            <div className="name">
                {item.id} - {item.name}
            </div>

            <ul>
                <DescriptionItem field={i18n.t("Authors")} value={item.authors} />
                <DescriptionItem field={i18n.t("Method")} value={item.method} />
                <DescriptionItem field={i18n.t("Resolution")} value={item.resolution} />
                <DescriptionItem field={i18n.t("Speciment state")} value={item.specimenState} />
            </ul>

            <div className="external-link">
                <Link name={i18n.t("External link")} url={item.url} />
            </div>
        </React.Fragment>
    );

    return (
        <div className={className} onMouseEnter={setMouseOverD} onMouseLeave={unsetMouseOverD}>
            <HtmlTooltip className="tooltip" title={description} placement="top">
                <div className="image">
                    <ReactImageFallback
                        className="image"
                        src={item.imageUrl}
                        fallbackImage="/images/no-image.png"
                        initialImage="/images/loading.gif"
                    />
                </div>
            </HtmlTooltip>

            <div className="name">{item.id}</div>

            <div className="actions">
                {isMouseOver && (
                    <div>
                        <button className="action" onClick={selectModel}>
                            {i18n.t("Select")}
                        </button>
                        <button className="action" onClick={appendModel}>
                            {i18n.t("Append")}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
});

const DescriptionItem: React.FC<{ field: string; value: string | undefined }> = props => {
    const { field, value } = props;
    if (!value) return null;

    return (
        <li>
            <span className="field">{field}:</span>
            <span className="value">{value}</span>
        </li>
    );
};

const HtmlTooltip = withStyles(theme => ({
    tooltip: {
        backgroundColor: "#f5f5f9",
        color: "rgba(0, 0, 0, 0.87)",
        maxWidth: 220,
        fontSize: theme.typography.pxToRem(12),
        border: "1px solid #dadde9",
    },
}))(Tooltip);
