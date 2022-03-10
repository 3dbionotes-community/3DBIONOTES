import React, { useEffect } from "react";
import {
    CircularProgress,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
} from "@material-ui/core";
import { Close, Search } from "@material-ui/icons";
import _ from "lodash";
import { DbModel, DbModelCollection } from "../../../domain/entities/DbModel";
import { useCallbackEffect } from "../../hooks/use-callback-effect";
import { useCallbackFromEventValue } from "../../hooks/use-callback-event-value";
import { useDebounce } from "../../hooks/use-debounce";
import { useBooleanState } from "../../hooks/use-boolean";
import i18n from "../../utils/i18n";
import { ActionType, DbItem } from "../../view-models/Selection";
import { useAppContext } from "../AppContext";
import { Dropdown, DropdownProps } from "../dropdown/Dropdown";
import "./ModelSearch.css";
import { ModelSearchItem } from "./ModelSearchItem";
import { ModelUpload } from "../model-upload/ModelUpload";
import { sendAnalytics } from "../../utils/analytics";
import { useGoto } from "../../hooks/use-goto";

export interface ModelSearchProps {
    title: string;
    onClose(): void;
    onSelect(actionType: ActionType, selected: DbItem): void;
}

type ModelSearchType = DbModel["type"] | "all";

export const ModelSearch: React.FC<ModelSearchProps> = React.memo(props => {
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
    const [isUploadOpen, { enable: openUpload, disable: closeUpload }] = useBooleanState(false);
    const [searchState, startSearch] = useDbModelSearch(modelType);
    const goTo = useGoto();

    const goToLoaded = React.useCallback(
        (options: { token: string }) => {
            goTo(`/uploaded/${options.token}`);
            onClose();
        },
        [goTo, onClose]
    );

    useEffect(() => {
        if (isUploadOpen)
            sendAnalytics({
                type: "event",
                category: "search_menu",
                action: "open_dialog",
                label: "Upload Model",
            });
    }, [isUploadOpen]);

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
                        selected={modelType}
                        items={modelTypes}
                        onClick={setModelType}
                        showExpandIcon
                    />
                    <button className="upload-model" onClick={openUpload}>
                        {i18n.t("Upload model")}
                    </button>
                    {isUploadOpen && (
                        <ModelUpload
                            title={i18n.t("Upload your atomic structure")}
                            onClose={closeUpload}
                            onLoaded={goToLoaded}
                        />
                    )}

                    {searchState.type === "searching" && (
                        <div className="spinner">
                            <CircularProgress />
                        </div>
                    )}
                </div>

                <div className="results">
                    {searchState.type === "results" && (
                        <React.Fragment>
                            {_.isEmpty(searchState.data) ? (
                                <div className="feedback">{i18n.t("No results")}</div>
                            ) : (
                                searchState.data.map((item, idx) => (
                                    <ModelSearchItem key={idx} item={item} onSelect={onSelect} />
                                ))
                            )}
                        </React.Fragment>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
});

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
            sendAnalytics({
                type: "event",
                category: "search_menu",
                action: "search",
                label: query,
            });

            const searchType = modelType === "all" ? undefined : modelType;
            return compositionRoot.searchDbModels
                .execute({ query, type: searchType })
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
