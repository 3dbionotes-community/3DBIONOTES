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
import InfiniteScroll from "react-infinite-scroll-component";

export interface ModelSearchProps {
    title: string;
    onClose(): void;
    onSelect(actionType: ActionType, selected: DbItem): void;
}

type ModelSearchType = DbModel["type"] | "all";

interface FormState { 
    startIndex: number;
    hasMore: boolean;
    itemsCount: number;
    data: DbModel[]; 
}

export const ModelSearch: React.FC<ModelSearchProps> = React.memo(props => {
    const { title, onClose, onSelect } = props;
    const { compositionRoot } = useAppContext();

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
    const [isUploadOpen, { enable: openUpload, disable: closeUpload }] = useBooleanState(false);
    const selectedFilterNames = modelTypeKeys.filter(key => modelTypeState[key]);
    const whichPlaceholder =
        selectedFilterNames.length === 1 && selectedFilterNames[0] ? selectedFilterNames[0] : "all";
    
    const [formState, setFormState] = React.useState<FormState>({
        startIndex: 0,
        hasMore: true,
        itemsCount: 0,
        data: []
    });

     type SearchDataState<Data> =
     | { type: "empty" }
     | { type: "searching" }
     | { type: "results"; data: Data };
 
 type SearchState = SearchDataState<DbModelCollection>;
    const [searchState, setSearchState] = React.useState<SearchState>({ type: "empty" });
    const [inputValue, setInputValue0] = React.useState<string>("");

    const search = React.useCallback(
        (query: string) => {
            setSearchState({ type: "searching" });
            const selectedFilterNames = modelTypeKeys.find(key => modelTypeState[key]);
            //if they are both false or both true, then just show all
            const searchType =
                modelTypeState.emdb === modelTypeState.pdb ? undefined : selectedFilterNames;
            return compositionRoot.searchDbModels
                .execute({ query, startIndex: formState.startIndex, type: searchType })
                .run(dbModelCollection => {
                    const newState: SearchState =
                        _.isEmpty(dbModelCollection) && !query
                            ? { type: "empty" }
                            : { type: "results", data: dbModelCollection };
                    setSearchState(newState);
                }, console.error);
        },
        [compositionRoot, modelTypeState, formState.startIndex]
    );
    const searchFromString = useCallbackEffect(search);
    const searchFromEv = useCallbackFromEventValue(searchFromString);
    const startSearch = useDebounce(searchFromEv, 200);
    const setInputValue = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue0(event.target.value);
        setFormState({data: [], hasMore: true, startIndex: 0, itemsCount: 0});
        if(event.target.value !== "") {
            startSearch(event);
        }
    }, [startSearch]);

    React.useEffect(() => {
        if(searchState.type === "results") {
            setFormState((prevForm: any) => {
                const newItems = prevForm.data.concat(searchState.data).reduce((acc: DbModelCollection, current: DbModel) => {
                    const x = acc.find(item => item.id === current.id);
                    if (!x) {
                        return acc.concat([current]);
                    } else {
                        return acc;
                    }
                }, []);
                const newState = {
                    ...prevForm,
                    data: newItems,
                    itemsCount: newItems.length,
                };
                if (newState.itemsCount >= 300) {
                    newState.hasMore = false;
                }
                return (newState)
            });
        }
    }, [searchState]);

    React.useEffect(() => {
        //this useEffect is so that if the startIndex changes (the user gets to the end of the scrollDiv), the search is triggered
        if(inputValue !== "") {
            search(inputValue); 
        }
    }, [formState.startIndex, inputValue, search]);

    const fetchMoreData = () => {
        if (formState.itemsCount <= 300) {
            setFormState(prevForm => ({ ...prevForm, startIndex: prevForm.startIndex + 30 }));
        }
    }

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
                            className="form-control"
                            placeholder={placeholders[whichPlaceholder]}
                            type="text"
                            value={inputValue}
                            onChange={setInputValue}
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
                {formState.data.length > 0 && (
                        <React.Fragment>
                            <InfiniteScroll
                              style={{flexDirection: "row", display: "flex", flexWrap: "wrap"}}
                              dataLength={formState.data.length} //This is important field to render the next data
                              next={fetchMoreData}
                              hasMore={formState.hasMore}
                              scrollableTarget="scrollableDiv"
                              loader={<p>Loading....</p>}
                              endMessage={
                                  <p style={{ textAlign: "center" }}>
                                      <b>End of EMDBs/PDBs</b>
                                  </p>
                              }
                          >
                                {formState.data.map((item, idx) => (
                                    <ModelSearchItem key={idx} item={item} onSelect={onSelect} />
                                ))}

                             
                          </InfiniteScroll>
                            

                        </React.Fragment>)}
                </div>
            </DialogContent>
        </Dialog>
    );
});

const initialModelTypeState: ModelTypeFilter = {
    emdb: false,
    pdb: false,
};

