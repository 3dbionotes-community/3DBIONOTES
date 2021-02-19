import React from "react";
import _ from "lodash";
import { HashRouter, Route, Switch } from "react-router-dom";
import "./App.css";
import { MolecularStructure } from "../../../webapp/components/molecular-structure/MolecularStructure";
import { AppContext } from "../../../webapp/components/AppContext";
import { ProtvistaViewer } from "../../components/protvista/ProtvistaViewer";
import { RootViewer } from "../../../webapp/components/RootViewer";
import { TrainingApp } from "../../../webapp/training-app";
import { modules } from "../../../webapp/training-app/training-modules";
import { ViewerSelector } from "../../components/viewer-selector/ViewerSelector";
import { buildDbItem, getItemParam, SelectionState } from "../../view-models/SelectionState";
import { useGoto } from "../../hooks/use-goto";

// TODO: Abstract
const MolecularStructurePage: React.FC<{ selector: string }> = props => {
    const { selector } = props;
    const goTo = useGoto();

    const mainSeparator = "|";
    const [main = "", overlay = ""] = selector.split(mainSeparator, 2);

    const [mainPdbRichId, mainEmdbRichId] = main.split("+", 2);
    const overlayIds = overlay.split("+");
    const pdbItem = buildDbItem(mainPdbRichId);

    const selection: SelectionState = {
        main: pdbItem
            ? {
                  pdb: pdbItem,
                  emdb: buildDbItem(mainEmdbRichId),
              }
            : undefined,
        overlay: _.compact(overlayIds.map(buildDbItem)),
    };

    const setSelection = React.useCallback(
        (newSelection: SelectionState) => {
            console.debug({ newSelection });
            const { main, overlay } = newSelection;
            const path = _([
                _.compact(main ? [getItemParam(main.pdb), getItemParam(main.emdb)] : []).join("+"),
                overlay.map(getItemParam).join("+"),
            ])
                .compact()
                .join(mainSeparator);
            console.debug({ path });

            goTo(path);
        },
        [goTo]
    );

    return (
        <div>
            <ViewerSelector selection={selection} onSelectionChange={setSelection} />
            <MolecularStructure selection={selection} />
        </div>
    );
};

function getTestSelection(options: { pdbId: string }): SelectionState {
    return {
        main: { pdb: { type: "pdb", id: options.pdbId, visible: true } },
        overlay: [{ type: "pdb", id: "1tqn", visible: false }],
    };
}

function App() {
    return (
        <AppContext>
            <HashRouter>
                <Switch>
                    <Route
                        path="/molstar/:selector"
                        render={({ match }) => (
                            <MolecularStructurePage selector={match.params.selector} />
                        )}
                    />

                    <Route path="/protvista" render={_props => <ProtvistaViewer />} />

                    <Route
                        path="/:pdbId"
                        render={props => {
                            const options = { pdbId: props.match.params.pdbId };
                            return <RootViewer selection={getTestSelection(options)} />;
                        }}
                    />
                </Switch>
            </HashRouter>

            {false && <TrainingApp locale="en" modules={modules} />}
        </AppContext>
    );
}

export default App;
