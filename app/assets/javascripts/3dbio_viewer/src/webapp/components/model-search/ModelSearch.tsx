import _ from "lodash";
import React from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import {
    CircularProgress,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
} from "@material-ui/core";
import { Close, CloudUpload as CloudUploadIcon, Search } from "@material-ui/icons";
import { DbModel, DbModelType } from "../../../domain/entities/DbModel";
import { useCallbackEffect } from "../../hooks/use-callback-effect";
import { useBooleanState } from "../../hooks/use-boolean";
import { ActionType, DbItem, MainType } from "../../view-models/Selection";
import { useAppContext } from "../AppContext";
import { ModelSearchItem } from "./ModelSearchItem";
import { ModelUpload } from "../model-upload/ModelUpload";
import { ModelSearchFilterMenu, ModelTypeFilter, modelTypeKeys } from "./ModelSearchFilterMenu";
import { useCallbackFromEventValue } from "../../hooks/use-callback-event-value";
import { sendAnalytics } from "../../utils/analytics";
import { useGoto } from "../../hooks/use-goto";
import { Maybe } from "../../../utils/ts-utils";
import { StyledButton } from "../../training-app/components/action-button/ActionButton";
import i18n from "../../utils/i18n";
import "./ModelSearch.css";

/* Search PDB/EMDB models from text and model type. As the search items to show are limited,
   we get all the matching models and use an infinite scroll just to render more items. Only a
   query text change issues a query to the API.
*/

export interface ModelSearchProps {
    title: string;
    onClose(): void;
    onSelect(actionType: ActionType, selected: DbItem<MainType>): void;
}

export const ModelSearch: React.FC<ModelSearchProps> = React.memo(props => {
    const { title, onClose, onSelect } = props;

    const [isUploadOpen, { open: openUpload, close: closeUpload }] = useBooleanState(false);
    const [formState, setFormState] = React.useState<FormState>(initialFormState);
    const [inputValue, setInputValue] = React.useState<string>("");

    const { models, data, startIndex, totals } = formState;

    const goTo = useGoto();
    const setSearchFromEvent = useSearch(formState, setFormState, inputValue, setInputValue);
    const filterTranslations = React.useMemo<Record<ModelSearchType, string>>(() => {
        return {
            pdb: i18n.t("Search PDB"),
            emdb: i18n.t("Search EMDB "),
            all: i18n.t("Search EMDB or PDB"),
        };
    }, []);

    const placeholder = React.useMemo(() => {
        const index = modelTypeKeys.every(key => formState.models[key])
            ? "all"
            : modelTypeKeys.find(key => formState.models[key]) || "all";
        return filterTranslations[index];
    }, [formState, filterTranslations]);

    const allItems = React.useMemo(() => {
        const showAll = models.pdb === models.emdb;
        return data.filter(item => showAll || models[item.type]);
    }, [data, models]);

    const visibleItems = React.useMemo(() => {
        return _.take(allItems, startIndex + pageSize);
    }, [allItems, startIndex]);

    const totalMatches = React.useMemo(() => {
        return (models.pdb ? totals.pdb : 0) + (models.emdb ? totals.emdb : 0);
    }, [totals, models]);

    const hasMore = visibleItems.length < allItems.length;

    const setModels = React.useCallback(
        (models: ModelTypeFilter) => setFormState(prev => ({ ...prev, models, startIndex: 0 })),
        [setFormState]
    );

    const fetchMoreData = React.useCallback(() => {
        setFormState(prevForm => ({ ...prevForm, startIndex: prevForm.startIndex + pageSize }));
    }, []);
    const goToLoaded = React.useCallback(
        (options: { token: string }) => {
            goTo(`/uploaded/${options.token}`);
            onClose();
        },
        [goTo, onClose]
    );

    const openUploadWithAnalytics = React.useCallback(() => {
        openUpload();
        sendAnalytics("open_dialog", {
            label: "Upload Model",
        });
    }, [openUpload]);

    return (
        <Dialog open={true} onClose={onClose} maxWidth="xl" fullWidth className="model-search">
            <DialogTitle>
                {title}
                <IconButton onClick={onClose}>
                    <Close />
                </IconButton>
            </DialogTitle>

            <DialogContent id="scrollableDiv">
                <div className="params">
                    <div className="search">
                        <input
                            aria-label={i18n.t("Search")}
                            className=""
                            placeholder={placeholder}
                            type="text"
                            value={inputValue}
                            onChange={setSearchFromEvent}
                        />
                        <Search />
                    </div>

                    <ModelSearchFilterMenu modelTypeState={models} setModelTypeState={setModels} />
                    <StyledButton className="model-search" onClick={openUploadWithAnalytics}>
                        {i18n.t("Upload model")}
                        <CloudUploadIcon fontSize="small" />
                    </StyledButton>
                    {isUploadOpen && (
                        <ModelUpload
                            title={i18n.t("Upload your atomic structure")}
                            onClose={closeUpload}
                            onLoaded={goToLoaded}
                        />
                    )}

                    {formState.type === "searching" && (
                        <div className="spinner">
                            <CircularProgress />
                        </div>
                    )}
                    {formState.type === "results" && (
                        <div style={styles.matching}>
                            {i18n.t("{{total}} matches (showing {{visible}})", {
                                total: totalMatches,
                                visible: allItems.length,
                            })}
                        </div>
                    )}
                </div>

                <div className="results">
                    {visibleItems.length > 0 && inputValue && (
                        <InfiniteScroll
                            style={styles.infiniteScroll}
                            dataLength={visibleItems.length}
                            next={fetchMoreData}
                            hasMore={hasMore}
                            scrollableTarget="scrollableDiv"
                            loader={<p>{i18n.t("Loading")}....</p>}
                        >
                            {visibleItems.map((item, idx) => (
                                <ModelSearchItem key={idx} item={item} onSelect={onSelect} />
                            ))}{" "}
                            {/* working on calling the search api when the user gets to the end */}
                        </InfiniteScroll>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
});

type ModelSearchType = DbModel["type"] | "all";

interface FormState {
    type: "empty" | "searching" | "results";
    query: string;
    startIndex: number;
    data: DbModel[];
    totals: Record<DbModel["type"], number>;
    models: ModelTypeFilter;
}

const initialFormState: FormState = {
    type: "empty",
    query: "",
    data: [],
    startIndex: 0,
    totals: { pdb: 0, emdb: 0 },
    models: { pdb: true, emdb: true },
};

const pageSize = 30;
const maxRenderedItems = 300;

const styles = {
    infiniteScroll: {
        display: "flex" as const,
        flexDirection: "row" as const,
        flexWrap: "wrap" as const,
    },
    matching: {
        marginLeft: "0.5em",
    },
};

function useUpdater<T>(dispatchFn: React.Dispatch<React.SetStateAction<T>>) {
    return React.useCallback(
        (partialValue: Partial<T>) => {
            dispatchFn(prev => ({ ...prev, ...partialValue }));
        },
        [dispatchFn]
    );
}

function useSearch(
    formState: FormState,
    setFormState: React.Dispatch<React.SetStateAction<FormState>>,
    inputValue: string,
    setInputValue: React.Dispatch<React.SetStateAction<string>>
) {
    const { compositionRoot } = useAppContext();
    const updateState = useUpdater(setFormState);

    const search = React.useCallback(
        (query: string) => {
            if (!query) {
                updateState({ type: "empty", data: [] });
                return;
            }

            updateState({ type: "searching" });
            sendAnalytics("search", {
                on: "viewer",
                query: query,
            });

            const type = getDbModelType(formState.models);

            return compositionRoot.searchDbModels
                .execute({ query, limit: maxRenderedItems, type })
                .run(
                    results => {
                        updateState({
                            type: "results",
                            data: results.items,
                            totals: results.totals,
                        });
                    },
                    err => {
                        console.error(err);
                        updateState({ type: "results" });
                    }
                );
        },
        [compositionRoot, updateState, formState.models]
    );

    const runSearch = useCallbackEffect(search);

    React.useEffect(() => {
        const timeoutId = setTimeout(() => {
            updateState({ query: inputValue, startIndex: 0 });
        }, 1000);

        return () => clearTimeout(timeoutId);
    }, [inputValue, updateState]);

    const setSearchFromEvent = useCallbackFromEventValue(setInputValue);

    React.useEffect(() => {
        return runSearch(formState.query);
    }, [runSearch, formState.query]);

    return setSearchFromEvent;
}

function getDbModelType(models: FormState["models"]): Maybe<DbModelType> {
    if (models.pdb && models.emdb) {
        return undefined;
    } else if (models.pdb) {
        return "pdb";
    } else if (models.emdb) {
        return "emdb";
    } else {
        return undefined;
    }
}
