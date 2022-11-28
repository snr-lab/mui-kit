import React from 'react';
import { Controller } from "react-hook-form";
import { FormControlProps, SelectProps, FormControl, FormHelperText, InputLabel, Select, CircularProgress, makeStyles, MenuItem } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
    loadingItem: {
        "&.Mui-disabled":{
            opacity: 1
        }
    },
    loading:{
        margin: "0 auto"
    }
}));

type FormControlSelectProps = SelectProps & FormControlProps;

interface FormSelectProps extends FormControlSelectProps{
    children: React.ReactNode
    name: string
    control: any
    label: string
    loading?: boolean
    rules?: any
    helperText?: string
}

export const FormSelect: React.FC<FormSelectProps> = (props) => {
    const {children, name, control, label, loading, rules, helperText, ...otherProps} = props;
    const classes = useStyles();
    return (
        <Controller render={ ({ field: { onChange, value }} ) => (
            <FormControl {...otherProps}>
                <InputLabel id={name+"__label"}>{label}</InputLabel>
                <Select labelId={name+"__label"} value={ loading? "" : value } onChange={ onChange } {...otherProps} >
                    {loading?
                        <MenuItem className={classes.loadingItem} value="" disabled>
                            <CircularProgress size={20} className={classes.loading} />
                        </MenuItem> 
                        : children
                    }
                </Select>
                <FormHelperText>{helperText}</FormHelperText>
            </FormControl>)
            }
            name={name}
            control={control}
            rules={rules}
        />
    );
}