import React from 'react';
import { FormControlLabel, Checkbox, CheckboxProps } from '@material-ui/core';
import { Controller } from "react-hook-form";

interface FormCheckboxProps extends CheckboxProps {
    name: string
    control: any
    label?: string
    labelPlacement?: "end" | "start" | "top" | "bottom"
}

export const FormCheckbox: React.FC<FormCheckboxProps> = (props) => {
    const {name, control, label, labelPlacement, ...otherProps} = props 
    return (
        <Controller 
            render={ ({ field: { onChange, value } }) => <FormControlLabel
                label={label}
                labelPlacement={labelPlacement}
                control={<Checkbox checked={ value } onChange={ onChange } {...otherProps} />}
                />
            } 
            name={name}
            control={control}
            />
    );
}