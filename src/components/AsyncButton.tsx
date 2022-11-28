import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Button, ButtonProps, CircularProgress } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
    updating: {
        position: "absolute",
        top: 8,
        left: "50%",
        marginLeft: -10
    }
}));

interface AsyncButtonProps extends ButtonProps{
    children: React.ReactNode;
    disabled?: boolean;
    updating?: boolean;
}

export const AsyncButton: React.FC<AsyncButtonProps> = (props) => {
    const {children, disabled, updating, ...buttonProps} = props
    const classes = useStyles();
    
    return (
        <Button {...buttonProps} disabled={disabled || updating}>
            {children}
            {updating && <CircularProgress size={20} className={classes.updating} />}
        </Button>
    );
}