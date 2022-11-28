import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { red} from '@material-ui/core/colors';
import { Publish, Warning} from '@material-ui/icons';
import { Box, CircularProgress, IconButton, Typography } from '@material-ui/core';
import { format as formatDate } from 'date-fns';
import { useAppToast } from './ToastProvider';

interface CellCompProps{
  tableProps: any;
  rowData: any;
  cellIndex: number,
  cellData: any;
  cellProps: any;
}

const useEmptyCellWarningStyles = makeStyles((theme) => ({
  warning: {
      color: red[500]
  }
}));

export const EmptyCellWarning: React.FC<CellCompProps> = (props) => {
  const {cellData} = props;
  const classes = useEmptyCellWarningStyles();
  return (cellData || <Warning className={classes.warning} />);
}

export const BooleanString: React.FC<CellCompProps> = (props) => {
  const {cellData} = props;
  return (
      <Typography variant="body2">{cellData?"Yes":"No"}</Typography>
  );
}

export const DateFormat: React.FC<CellCompProps> = (props) => {
  const {cellData, cellProps} = props;
  return (
      <Typography variant="body2">{ formatDate(cellData, cellProps.format) }</Typography>
  );
}

const fileUploadStyles = makeStyles((theme) => ({
  uploadBtnContainer: {
    position: "relative"
  },
  uploadInput: {
    display: "none"
  },
  uploadBtn: {
      display: "inline-block",
      marginTop: -theme.spacing(1.5),
      marginBottom: -theme.spacing(1.5),
  },
  uploading: {
    position: "absolute",
    left: "50%",
    marginLeft: -10
  }
}));

export const FileUpload: React.FC<CellCompProps> = (props) => {
  const {rowData, cellProps, cellIndex} = props;
  const classes = fileUploadStyles();
  const [showToast] = useAppToast();
  const [uploading, setUploading] = useState(false);
  const uploadFile = async (file: any) => {
    setUploading(true);
    if(typeof cellProps.onFileSelected === "function"){
      cellProps.onFileSelected(
        file,
        rowData,
        (message?: string) => {
          setUploading(false);
          showToast({
            severity: "success",
            message: message || "File uploaded successfully"
          });
        },
        (message?: string) => {
          setUploading(false);
          showToast({
            severity: "error",
            message: message || "Failed to upload file"
          });
        }
      );
    }
  }
  return (
    <Box>
      <input className={classes.uploadInput} accept={cellProps.fileType} id={rowData.id+"_index-"+cellIndex} type="file" onChange={e => uploadFile(e.target.files?.[0])} disabled={uploading} />
      <label htmlFor={rowData.id+"_index-"+cellIndex} className={classes.uploadBtnContainer}>
        <IconButton className={classes.uploadBtn} aria-label="File upload" component="span" disabled={uploading}>
          <Publish />
        </IconButton>
        {uploading && <CircularProgress size={20} className={classes.uploading} />}
      </label>
    </Box>
  );
}
