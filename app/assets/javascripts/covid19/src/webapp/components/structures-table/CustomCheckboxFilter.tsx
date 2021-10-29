import * as React from 'react';
import { FormGroup, FormControlLabel, Checkbox } from '@material-ui/core';

export interface CustomCheckboxFilterProps {
    filterState: FilterModelBodies;
    setFilterState(filter: FilterModelBodies): void;
}
export interface FilterModelBodies  {
    antibody: boolean;
    nanobody: boolean;
    sybody: boolean;
}

//: React.FC<CustomCheckboxFilterProps>
export const CustomCheckboxFilter = React.memo(() => {
    //const { filterState, setFilterState } = props;
    const [filterState, setFilterState] = React.useState({
      antibody: false,
      nanobody: false,
      sybody: false,
    });
      const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFilterState({
          ...filterState,
          [event.target.name]: event.target.checked,
        });
      };
    
      const { antibody, nanobody, sybody } = filterState;
  return (
    <FormGroup style={{display: "flex", flexDirection: "row"}}>
      <FormControlLabel control={<Checkbox checked={antibody} onChange={handleChange} name="antibody" />} 
      label="show models antibodies" />
      <FormControlLabel control={<Checkbox checked={nanobody} onChange={handleChange} name="nanobody" />} label="show models nanobodies" />
      <FormControlLabel control={<Checkbox checked={sybody} onChange={handleChange} name="sybody" />} label="show models sybodies" />
    </FormGroup>
  );
});