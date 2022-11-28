import React from 'react';
import { TextField, StandardTextFieldProps } from '@material-ui/core';
import { Controller } from "react-hook-form";

interface FormTextFieldProps extends StandardTextFieldProps {
    name: string
    control: any
    rules?: any
}

export const FormTextField: React.FC<FormTextFieldProps> = (props) => {
    const {name, control, rules, ...otherProps} = props 
    return (
        <Controller 
            render={ ({ field: { onChange, value }} ) => <TextField defaultValue={ value } onChange={ onChange } {...otherProps} /> }
            name={name}
            control={control}
            rules={rules}
        />
    );
}