import React, { Fragment, useState, useContext, createContext, useRef } from "react";
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from "@material-ui/core";
import { makeStyles } from '@material-ui/core/styles';
import { AsyncButton } from "./AsyncButton";

interface ConfirmationOptions {
	variant: "confirm" | "info";
	title: string;
	description: string;
	asyncSubmit?: boolean;
	confirmText?: string;
	cancelText?: string;
	okText?: string;
}

interface ConfirmationDialogProps extends ConfirmationOptions {
	open: boolean;
	submitting: boolean;
	onSubmit: () => void;
	onClose: () => void;
}

const useConfirmationDialogStyles = makeStyles((theme) => ({
    title:{
       minWidth: 200
    },
    submitting: {
        position: "absolute"
    }
}));

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = (props) => {
  const { open, submitting, onSubmit, onClose, title, variant, description, asyncSubmit, confirmText, cancelText, okText } = props;
  const classes = useConfirmationDialogStyles();
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle id="alert-dialog-title" className={classes.title}>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{description}</DialogContentText>
      </DialogContent>
      <DialogActions>
        {variant === "confirm" && (
          <Fragment>
            <Button color="primary" onClick={onClose} autoFocus disabled={asyncSubmit && submitting}>
              {cancelText || "Cancel"}
            </Button>
            <AsyncButton color="primary" onClick={onSubmit} updating={asyncSubmit && submitting}>
              {confirmText || "Confirm"}
            </AsyncButton>
          </Fragment>
        )}
        {variant === "info" && (
          <AsyncButton color="primary" onClick={onSubmit} updating={asyncSubmit && submitting}>
            {okText || "Ok"}
          </AsyncButton>
        )}
      </DialogActions>
    </Dialog>
  );
};

const ConfirmationServiceContext = createContext<[
  (options: ConfirmationOptions) => Promise<void>,
  () => void
]>([Promise.reject, () => {}]);

export const useAppConfirmation = () => useContext(ConfirmationServiceContext);

type ConfirmationProps = {
    children: React.ReactNode;
}

export const ConfirmProvider: React.FC<ConfirmationProps> = ({ children }) => {
  const [confirmationState, setConfirmationState] = useState<ConfirmationOptions | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const awaitingPromiseRef = useRef<{
    resolve: () => void;
    reject: () => void;
  }>();

  const openConfirmation = (options: ConfirmationOptions) => {
    setConfirmationState(options);
    return new Promise<void>((resolve, reject) => {
      awaitingPromiseRef.current = { resolve, reject };
    });
  };

  const handleClose = () => {
    if (awaitingPromiseRef.current) {
      awaitingPromiseRef.current.reject();
    }
    setConfirmationState(null);
    setSubmitting(false);
  };

  const handleSubmit = () => {
    if(confirmationState && !confirmationState.asyncSubmit){
      setConfirmationState(null);
      setSubmitting(false);
    }else{
      setSubmitting(true);
    }
    if (awaitingPromiseRef.current) {
      awaitingPromiseRef.current.resolve();
    }
  };

  return (
    <Fragment>
      <ConfirmationServiceContext.Provider
        value={[openConfirmation, handleClose]}
        children={children}
      />
        {confirmationState && <ConfirmationDialog
          open={Boolean(confirmationState)}
          onSubmit={handleSubmit}
          onClose={handleClose}
          submitting={submitting}
          {...confirmationState}
        />}
    </Fragment>
  );
};
