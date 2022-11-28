import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import { Controller, useFormState, useWatch } from "react-hook-form";
import { FormControlProps, SelectProps, FormControl, FormHelperText, CircularProgress, makeStyles, TextField } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';

const useStyles = makeStyles((theme) => ({
	typeAheadInput: {
		width: "100%"
	},
	loadingItem: {
		"&.Mui-disabled": {
			opacity: 1
		}
	},
	loading: {
		margin: "0 auto"
	}
}));

type FormControlSelectProps = SelectProps & FormControlProps;

interface FormAutocompleteProps extends FormControlSelectProps {
	name: string
	control: any
	label: string
	options: {
		label: string
		value: string | number
	}[]
	loading?: boolean
	rules?: any
	helperText?: string
}

export const FormAutocomplete: React.FC<FormAutocompleteProps> = (props) => {
	const { name, control, label, options, loading, rules, helperText, ...otherProps } = props;
	const classes = useStyles();
	const [inputValue, setInputValue] = useState("");
	const currentValue = useWatch({control, name});
	const { errors } = useFormState({ control, name });
	
	useEffect(() => {
		options.forEach((option) => {
			if(option.value === currentValue){
				setInputValue(option.label);
			}
		});
	},[ options, currentValue ]);
	return (
		<Controller render={({ field: { onChange, value } }) => (
			<FormControl {...otherProps}>
				<Autocomplete
					options={options}
					loading={loading}
					className={classes.typeAheadInput}
					getOptionLabel={(option) => typeof option.label !== "undefined" ? option.label : ""}
					getOptionSelected={(option, value)=>{
						if(options.length <= 0){
							return true;
						}
						if(option.value === value.value){
							return true;
						}
						return false;
					}}
					inputValue={inputValue}
					onChange={(event: any, newOption) => { onChange(newOption ? newOption.value : null) }}
					onInputChange={(event: any, inputChangeValue: string) => setInputValue(inputChangeValue)}
					renderInput={(params) => <TextField
						{...params}
						label={label}
						InputProps={{
							...params.InputProps,
							className: clsx(params.InputProps.className, errors[name] && "Mui-error"),
							endAdornment: (
								<React.Fragment>
									{loading ? <CircularProgress color="inherit" size={20} /> : null}
									{params.InputProps.endAdornment}
								</React.Fragment>
							),
						}}
						InputLabelProps={{
							...params.InputLabelProps,
							className: clsx(params.InputProps.className, errors[name] && "Mui-error"),
						}}
					/>}
				/>
				<FormHelperText>{helperText}</FormHelperText>
			</FormControl>)}
			name={name}
			control={control}
			rules={rules}
		/>
	);
}