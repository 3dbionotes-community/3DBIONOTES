import React from "react";
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
import "./ModelSearch.css";
import { ModelSearchItem } from "./ModelSearchItem";
import { ModelUpload } from "../model-upload/ModelUpload";
import { ModelSearchFilterMenu, ModelTypeFilter, modelTypeKeys  } from "./ModelSearchFilterMenu";

export interface ModelSearchProps {
    title: string;
    onClose(): void;
    onSelect(actionType: ActionType, selected: DbItem): void;
}

type ModelSearchType = DbModel["type"] | "all";

export const ModelSearch: React.FC<ModelSearchProps> = React.memo(props => {
    const { title, onClose, onSelect } = props;

    const placeholders = React.useMemo<Record<ModelSearchType, string>>(() => {
        return {
            pdb: i18n.t("Search PDB"),
            emdb: i18n.t("Search EMDB "),
            all: i18n.t("Search EMDB or PDB"),
        };
    }, []);

    const [modelTypeState, setModelTypeState] = React.useState<ModelTypeFilter>(
        initialModelTypeState
    );
    const [searchState, startSearch] = useDbModelSearch(modelTypeState);
    const [isUploadOpen, { enable: openUpload, disable: closeUpload }] = useBooleanState(false);
    const selectedFilterNames = modelTypeKeys.filter(key => modelTypeState[key]);
    const whichPlaceholder =
        selectedFilterNames.length === 1 && selectedFilterNames[0] ? selectedFilterNames[0] : "all";

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
                            placeholder={placeholders[whichPlaceholder]}
                            type="text"
                            onChange={startSearch}
                        />
                        <Search />
                    </div>

                    <ModelSearchFilterMenu
                        modelTypeState={modelTypeState}
                        setModelTypeState={setModelTypeState}
                    />
                    <button className="model-search" onClick={openUpload}>
                        {i18n.t("Upload model")}
                    </button>
                    {isUploadOpen && (
                        <ModelUpload
                            title={i18n.t("Upload your atomic structure")}
                            onClose={closeUpload}
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

function useDbModelSearch(modelTypeState: ModelTypeFilter) {
    const { compositionRoot } = useAppContext();
    const [searchState, setSearchState] = React.useState<SearchState>({ type: "empty" });
    const selectedFilterNames = modelTypeKeys.find(key => modelTypeState[key]);

    const search = React.useCallback(
        (query: string) => {
            setSearchState({ type: "searching" });
            //if they are both false or both true, then just show all
            const searchType =
                modelTypeState.emdb === modelTypeState.pdb ? undefined : selectedFilterNames;
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
        [compositionRoot, modelTypeState, selectedFilterNames]
    );

    const searchFromString = useCallbackEffect(search);
    const searchFromEv = useCallbackFromEventValue(searchFromString);
    const startSearch = useDebounce(searchFromEv, 200);

    return [searchState, startSearch] as const;
}

const initialModelTypeState: ModelTypeFilter = {
    emdb: false,
    pdb: false,
};
