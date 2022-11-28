import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Switch, SwitchProps, CircularProgress } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
    switchContainer: {
        display: "inline-block",
        position: "relative"
    },
    updating: {
        position: "absolute",
        top: 10,
        left: 20
    }
}));

interface AsyncSwitchProps extends SwitchProps{
    disabled?: boolean;
    updating?: boolean;
}

export const AsyncSwitch: React.FC<AsyncSwitchProps> = (props) => {
    const {disabled, updating, ...switchProps} = props
    const classes = useStyles();
    
    return (
        <Box className={classes.switchContainer}>
            <Switch
                {...switchProps}
                disabled={disabled || updating}
            />
            {updating && <CircularProgress size={20} className={classes.updating} />}
        </Box>
    );
}