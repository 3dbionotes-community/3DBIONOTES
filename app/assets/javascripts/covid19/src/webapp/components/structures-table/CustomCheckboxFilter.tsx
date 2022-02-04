import * as React from "react";
import { FormGroup, FormControlLabel, Checkbox } from "@material-ui/core";
import { EntityBodiesFilter } from "../../../domain/entities/Covid19Info";

export interface CustomCheckboxFilterProps {
    filterState: EntityBodiesFilter;
    setFilterState(filter: EntityBodiesFilter): void;
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
        <FormGroup style={{ display: "flex", flexDirection: "row", marginLeft: 15 }}>
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
