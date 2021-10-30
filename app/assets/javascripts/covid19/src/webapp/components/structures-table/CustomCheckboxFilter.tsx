import * as React from "react";
import { FormGroup, FormControlLabel, Checkbox } from "@material-ui/core";

export interface CustomCheckboxFilterProps {
    filterState: FilterModelBodies;
    setFilterState(filter: FilterModelBodies): void;
}
export interface FilterModelBodies {
    antibody: boolean;
    nanobody: boolean;
    sybody: boolean;
}

export const CustomCheckboxFilter: React.FC<CustomCheckboxFilterProps> = React.memo(props => {
    const { filterState, setFilterState } = props;

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFilterState({
            ...filterState,
            [event.target.name]: event.target.checked,
        });
    };

    return (
        <FormGroup style={{ display: "flex", flexDirection: "row" }}>
            <FormControlLabel
                control={
                    <Checkbox
                        checked={filterState?.antibody || false}
                        onChange={handleChange}
                        name="antibody"
                    />
                }
                label="Antibodies"
            />
            <FormControlLabel
                control={
                    <Checkbox
                        checked={filterState?.nanobody || false}
                        onChange={handleChange}
                        name="nanobody"
                    />
                }
                label="Nanobodies"
            />
            <FormControlLabel
                control={
                    <Checkbox
                        checked={filterState?.sybody || false}
                        onChange={handleChange}
                        name="sybody"
                    />
                }
                label="Sybodies"
            />
        </FormGroup>
    );
});
