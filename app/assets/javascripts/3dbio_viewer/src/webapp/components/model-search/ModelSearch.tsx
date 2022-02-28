import React from "react";
import {
    CircularProgress,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    TextField
} from "@material-ui/core";
import { Close, Search } from "@material-ui/icons";
import _ from "lodash";
import { DbModel, DbModelCollection } from "../../../domain/entities/DbModel";
import { useCallbackEffect } from "../../hooks/use-callback-effect";
import { useCallbackFromEventValue } from "../../hooks/use-callback-event-value";
import { useDebounce } from "../../hooks/use-debounce";
import { useBooleanState } from "../../hooks/use-boolean";
import useWindowDimensions from "../../hooks/use-window-dimension";
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
    const { height } = useWindowDimensions();
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

    /*
     when I call the API, it will return me 30 at a time. I'll stop at 300 
     So if I want to go to the next "page" then I should set the start index as itemsCount + 30. 
     and I also need to save the previous search's data and merge it with the new data. But make sure the data does not overlap
     However if the search input changes at all the items count should go back to zero and the infinite scroll will start again

     step 1: call the fetch at the appropriate time and merge the data together
     step 2: get the proper paging/next function to work 

    */
    const [searchState, startSearch] = useDbModelSearch(modelTypeState, 0);
    console.log(searchState);

    React.useEffect(() => {
        console.log("hello!")
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
                console.log(newItems)
                const newState = {
                    ...prevForm,
                    itemsCount: newItems.length,
                };
                if (newState.itemsCount >= 300) {
                    newState.hasMore = false;
                }
                console.log(newState);
                return ({...prevForm, itemsCount: prevForm.itemsCount + searchState.data.length})
            });
        }
    }, [searchState]);

    /*React.useEffect(() => {
        if(searchState.type === "results") {
            setFormState((prevForm: any) => ({...prevForm, itemsCount: prevForm.itemsCount + searchState.data.length}));
        }
        if(searchState.type === "searching") {
            setFormState((prevForm: any) => ({...prevForm, itemsCount: 0}));
        }
    }, [searchState]);
    
    I need to call the search function*/


    const proteinsToShow = searchState.type === "results" ? searchState.data
        .reduce<DbModelCollection>((acc, current) => {
            const x = acc.find(item => item.id === current.id);
            if (!x) {
                return acc.concat([current]);
            } else {
                return acc;
            }
        }, []) : [];
        console.log(proteinsToShow)
    /*
    I need to know when the scroll has more to show 
    */
    const fetchMoreData = () => {
        console.log("fetch data!")
        if (formState.itemsCount >= 300) {
            setFormState(prevForm => ({ ...prevForm, hasMore: false }));
        } else {
            setFormState(prevForm => ({ ...prevForm, startIndex: prevForm.startIndex + 30 }));
        }
    }
    
    return (
        <Dialog open={true} onClose={onClose} maxWidth="xl" style={{height: height}} fullWidth className="model-search">
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
                            <InfiniteScroll
                              style={{flexDirection: "row", display: "flex", flexWrap: "wrap"}}
                              dataLength={proteinsToShow.length} //This is important field to render the next data
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
                               {_.isEmpty(searchState.data) ? (
                                <div className="feedback">{i18n.t("No results")}</div>
                            ) : (
                                proteinsToShow.map((item, idx) => (
                                    <ModelSearchItem key={idx} item={item} onSelect={onSelect} />
                                ))
                            )}

                             
                          </InfiniteScroll>
                            

                        </React.Fragment>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
});
  
//style={{display: "flex", flexWrap: "wrap"}}
type SearchDataState<Data> =
    | { type: "empty" }
    | { type: "searching" }
    | { type: "results"; data: Data };

type SearchState = SearchDataState<DbModelCollection>;

//this debouce thing is used when stuff is done inside hte search box 
//however for my situation I just want to call the search again for scrolling, but the same input
function useDbModelSearch(modelTypeState: ModelTypeFilter, startIndex: number) {
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
                .execute({ query, startIndex, type: searchType })
                .run(dbModelCollection => {
                    const newState: SearchState =
                        _.isEmpty(dbModelCollection) && !query
                            ? { type: "empty" }
                            : { type: "results", data: dbModelCollection };
                    setSearchState(newState);
                }, console.error);
        },
        [compositionRoot, modelTypeState, selectedFilterNames, startIndex]
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

