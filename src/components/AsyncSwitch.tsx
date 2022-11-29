import React from 'react';
import clsx from 'clsx';
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
    },
    hiddenSwitch: {
        opacity: 0
    },
    iconSwitch: {
        position: "absolute",
        top: 0,
        left: 0,
        height: "100%",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
    }
}));

interface AsyncSwitchProps extends SwitchProps{
    disabled?: boolean;
    updating?: boolean;
    onIcon?: React.ReactElement<any, any>,
    offIcon?: React.ReactElement<any, any>
}

export const AsyncSwitch: React.FC<AsyncSwitchProps> = (props) => {
    const {disabled, updating, onIcon, offIcon, ...switchProps} = props
    const classes = useStyles();
    
    return (
        <Box className={classes.switchContainer}>
            {onIcon && offIcon && <div className={classes.iconSwitch}>
                {switchProps.checked && onIcon}
                {!switchProps.checked && offIcon}
            </div>}
            <div className={clsx(onIcon && offIcon && classes.hiddenSwitch)}>
                <Switch
                    {...switchProps}
                    disabled={disabled || updating}
                />
            </div>
            {updating && <CircularProgress size={20} className={classes.updating} />}
        </Box>
    );
}