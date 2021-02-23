import React from "react";
import _ from "lodash";
import { Close, Search } from "@material-ui/icons";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    CircularProgress,
} from "@material-ui/core";
import classnames from "classnames";

import i18n from "../../utils/i18n";
import { Dropdown, DropdownProps } from "../dropdown/Dropdown";
import { useBooleanState } from "../../hooks/use-boolean";
import { useDebounce } from "../../hooks/use-debounce";

import { DbModel, DbModelCollection } from "../../../domain/entities/DbModel";
import { useAppContext } from "../AppContext";
import { useCallbackEffect } from "../../hooks/use-callback-effect";

import "./ModelSearch.css";
import { useCallbackFromEventValue } from "../../hooks/use-callback-event-value";
import { ActionType } from "../../view-models/SelectionState";

export interface ModelSearchProps {
    title: string;
    onClose(): void;
    onSelect(actionType: ActionType, selected: DbModel): void;
}

type ModelSearchType = DbModel["type"] | "all";

export const ModelSearch: React.FC<ModelSearchProps> = props => {
    const { title, onClose, onSelect } = props;

    const modelTypes = React.useMemo<DropdownProps<ModelSearchType>["items"]>(() => {
        return [
            { id: "all", text: i18n.t("EMDB/PDB") },
            { id: "emdb", text: i18n.t("EMDB") },
            { id: "pdb", text: i18n.t("PDB") },
        ];
    }, []);

    const placeholders = React.useMemo<Record<ModelSearchType, string>>(() => {
        return {
            all: i18n.t("Search EMDB or PDB"),
            pdb: i18n.t("Search PDB"),
            emdb: i18n.t("Search EMDB "),
        };
    }, []);

    const [modelType, setModelType] = React.useState<ModelSearchType>("all");
    const [searchState, startSearch] = useDbModelSearch(modelType);

    return (
        <Dialog open={true} onClose={onClose} maxWidth="xl" fullWidth className="model-search">
            <DialogTitle>
                {title}
                <IconButton onClick={onClose}>
                    <Close />
                </IconButton>
            </DialogTitle>

            <DialogContent>
                <div className="params">
                    <div className="search">
                        <input
                            aria-label={i18n.t("Search")}
                            className="form-control"
                            placeholder={placeholders[modelType]}
                            type="text"
                            onChange={startSearch}
                        />
                        <Search />
                    </div>

                    <Dropdown<ModelSearchType>
                        text={i18n.t("Model type")}
                        value={modelType}
                        items={modelTypes}
                        onClick={setModelType}
                        showExpandIcon
                    />

                    <button className="upload-model">{i18n.t("Upload model")}</button>

                    {searchState.type === "searching" && (
                        <div className="spinner">
                            <CircularProgress />
                        </div>
                    )}
                </div>

                <div className="results">
                    <div className="models">
                        {searchState.type === "results" &&
                            searchState.data.map((item, idx) => (
                                <ModelItem key={idx} item={item} onSelect={onSelect} />
                            ))}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

type SearchDataState<Data> =
    | { type: "empty" }
    | { type: "searching" }
    | { type: "results"; data: Data };

type SearchState = SearchDataState<DbModelCollection>;

function useDbModelSearch(modelType: ModelSearchType) {
    const { compositionRoot } = useAppContext();
    const [searchState, setSearchState] = React.useState<SearchState>({ type: "empty" });

    const search = React.useCallback(
        (query: string) => {
            setSearchState({ type: "searching" });
            const searchType = modelType === "all" ? undefined : modelType;

            return compositionRoot
                .searchDbModels({ query, type: searchType })
                .run(dbModelCollection => {
                    const newState: SearchState =
                        _.isEmpty(dbModelCollection) && !query
                            ? { type: "empty" }
                            : { type: "results", data: dbModelCollection };
                    setSearchState(newState);
                }, console.error);
        },
        [compositionRoot, modelType]
    );

    const searchFromString = useCallbackEffect(search);
    const searchFromEv = useCallbackFromEventValue(searchFromString);
    const startSearch = useDebounce(searchFromEv, 200);

    return [searchState, startSearch] as const;
}

const ModelItem: React.FC<{
    item: DbModel;
    onSelect: ModelSearchProps["onSelect"];
}> = props => {
    const { item, onSelect } = props;
    const [isMouseOver, { enable: setOver, disable: unsetOver }] = useBooleanState(false);
    const debounceMs = 50;
    const setMouseOverD = useDebounce(setOver, debounceMs);
    const unsetMouseOverD = useDebounce(unsetOver, debounceMs);
    const className = classnames("item", isMouseOver ? "hover" : null);
    const selectModel = React.useCallback(() => onSelect("select", item), [onSelect, item]);
    const appendModel = React.useCallback(() => onSelect("append", item), [onSelect, item]);
    const title = `[${item.score.toFixed(3)}] ${item.description}`;

    return (
        <div className={className} onMouseEnter={setMouseOverD} onMouseLeave={unsetMouseOverD}>
            <div className="image">
                <img src={item.imageUrl} title={title} />
            </div>

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
};
