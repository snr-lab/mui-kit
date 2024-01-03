import { Fragment, useEffect, useState } from 'react';
import clsx from 'clsx';
import { createStyles, lighten, makeStyles, Theme } from '@material-ui/core/styles';
import { Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TableSortLabel, Typography, Checkbox, IconButton, Tooltip, CircularProgress, Toolbar, Menu, MenuItem, ListItemText, Box, InputBase } from '@material-ui/core';
import {Visibility, Delete, FilterList, AddCircleOutline, Search} from '@material-ui/icons';

type TableColumn = {
  id: string;
  label: string | React.FunctionComponent<any>;
  CellComponent?: React.FunctionComponent<any>;
  objectPath?: string;
  isSortable?: boolean;
  alignRight?: boolean;
  cellProps?: object;
  hidden?: boolean;
  alwaysAvailable?: boolean;
}

type Order = 'asc' | 'desc';

function deepFind(obj: any, path: string) {
  const paths = path.split('.');
  let current = obj;
  for (let i = 0; i < paths.length; ++i) {
    if (typeof current[paths[i]] === "undefined") {
      return undefined;
    } else {
      current = current[paths[i]];
    }
  }
  return current;
}

function comparatorFunc<T>(a: T, b: T,  order: Order, orderBy: string) {
  const valueA = deepFind(a, String(orderBy));
  const valueB = deepFind(b, String(orderBy));
  if (valueB < valueA) {
    return order === 'desc' ? -1 : 1;
  }
  if (valueB > valueA) {
    return order === 'desc' ? 1 : -1;
  }
  return 0;
}

export function sortRows<T>(array: T[], order: Order, orderBy: string) {
  const comparator = (a: T, b: T) => comparatorFunc(a, b, order, orderBy);
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

function getVisibleColumns(columns: TableColumn[]){
  return columns.filter((column) => {
    if(column.alwaysAvailable || !column.hidden){
      return true;
    }
    return false;
  });
}

function getFlexibleColumns(columns: TableColumn[]){
  return columns.filter((column) => {
    return !column.alwaysAvailable;
  });
}

type EnhancedTableHeadProps = {
  classes: ReturnType<typeof useStyles>;
  visibleColumns: TableColumn[];
  numSelected: number;
  onRequestSort: (event: React.MouseEvent<unknown>, property: string) => void;
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void;
  order: Order;
  orderBy: string;
  rowCount: number;
  disableSelection: boolean | undefined;
}

const EnhancedTableHead: React.FC<EnhancedTableHeadProps> = (props) => {
  const { classes, visibleColumns, onSelectAllClick, order, orderBy, numSelected, rowCount, disableSelection, onRequestSort } = props;
  const createSortHandler = (property: string) => (event: React.MouseEvent<unknown>) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {!disableSelection && <TableCell padding="checkbox">
          <Checkbox
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{ 'aria-label': 'select all' }}
          />
        </TableCell>}
        {visibleColumns.map((column) => (
          <TableCell
            key={column.id}
            align={column.alignRight ? 'right' : 'left'}
            padding='normal'
            sortDirection={orderBy === column.id ? order : false}
          >
            {((typeof column.CellComponent !== "function") || column.isSortable) && <TableSortLabel
              active={orderBy === column.id}
              direction={orderBy === column.id ? order : 'asc'}
              onClick={createSortHandler(column.objectPath ? column.id+"."+column.objectPath : column.id)}
            >
              { typeof column.label === "function"? <column.label /> : column.label}
            </TableSortLabel>}
            {((typeof column.CellComponent === "function") && !column.isSortable) && <span className={classes.componentCellLabel}>
              {typeof column.label === "function"? <column.label /> : column.label}
            </span>}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

const useToolbarStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(1),
    },
    highlight:
      theme.palette.type === 'light'
        ? {
            color: theme.palette.secondary.main,
            backgroundColor: lighten(theme.palette.secondary.light, 0.85),
          }
        : {
            color: theme.palette.text.primary,
            backgroundColor: theme.palette.secondary.dark,
          },
    title: {
      flex: '1 1 100%',
    },
    searchRoot: {
      padding: '0 4px',
      display: 'flex',
      alignItems: 'center',
      width: 400,
      border: '1px solid rgba(0, 0, 0, 0.54)',
      height: 36,
      borderRadius: 4,
      marginRight: theme.spacing(2),
    },
    searchInput: {
      marginLeft: theme.spacing(1),
      flex: 1,
    },
    searchIcon: {
      padding: 10,
      color: 'rgba(0, 0, 0, 0.54)',
      height: 42
    },
    deleting: {
      position: "absolute",
      left: "50%",
      marginLeft: -10
    }
  }),
);

type EnhancedTableToolbarProps = {
  title: string;
  selected: string[];
  allSelected: boolean;
  columns: TableColumn[];
  updateColumns: (columns: TableColumn[]) => void;
  onFilterList?: () => void;
  onRowAdd?: () => void;
  onRowDelete?: (selected: string[]) => void;
  onSearchChange?: (query: string) => void;
  isDeleting?: boolean;
  page: number,
  changePage: (event: unknown, newPage: number) => void
}

const EnhancedTableToolbar: React.FC<EnhancedTableToolbarProps> = (props) => {
  const classes = useToolbarStyles();
  const { title, selected, allSelected, columns, updateColumns, onFilterList, onRowAdd, onRowDelete, onSearchChange, isDeleting, page, changePage } = props;
  const [visibleColumnMenuEl, setVisibleColumnMenuEl] = useState<null | HTMLElement>(null);

  const filterList = () => {
    if(typeof onFilterList === "function"){
      onFilterList();
    }
  }
  const addRow = () => {
    if(typeof onRowAdd === "function"){
      onRowAdd();
    }
  }
  const deleteRow = () => {
    if(typeof onRowDelete === "function" && !isDeleting){
      if(page > 0 && allSelected){
        changePage(null, page - 1);
      }
      onRowDelete(selected);
    }
  }
  const setVisibleColumns = () => {
    setVisibleColumnMenuEl(null);
  }

  const changeColumnVisiblity = (changeColumnIndex: number) => {
    const newColumns = columns.map((column, columnIndex) => {
      const newColumn = {...column};
      if(columnIndex === changeColumnIndex){
        newColumn.hidden = !column.hidden;
      }
      return newColumn;
    });
    updateColumns(newColumns);
  }

  return (
    <Toolbar
      className={clsx(classes.root, {
        [classes.highlight]: selected.length > 0,
      })}
    >
      {selected.length > 0 ? (
        <Typography className={classes.title} color="inherit" variant="subtitle1" component="div">
          {selected.length} selected
        </Typography>
      ) : (
        <Typography className={classes.title} variant="h6" id="tableTitle" component="div">
          {title}
        </Typography>
      )}
      {selected.length > 0 ? (
        <Fragment>
          {typeof onRowDelete === "function" && <Tooltip title="Delete">
            <IconButton aria-label="Delete item" onClick={deleteRow} disabled={ isDeleting }>
              <Delete />
              { isDeleting && <CircularProgress size={20} className={classes.deleting} /> }
            </IconButton>
          </Tooltip>}
        </Fragment>
      ) : (
        <Fragment>
          {typeof onSearchChange === "function" && <Box component="form" className={classes.searchRoot}>
            <InputBase
              className={classes.searchInput}
              placeholder="Search"
              inputProps={{ 'aria-label': 'search' }}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            <Box className={classes.searchIcon}>
              <Search />
            </Box>
          </Box>}
          {typeof onRowAdd === "function" && <Tooltip title="Add item">
            <IconButton aria-label="Add item" onClick={addRow}>
              <AddCircleOutline />
            </IconButton>
          </Tooltip>}
          {typeof onFilterList === "function" && <Tooltip title="Filter list">
            <IconButton aria-label="Filter list" onClick={filterList}>
              <FilterList />
            </IconButton>
          </Tooltip>}
          <Tooltip title="Visible columns">
            <IconButton aria-label="Visible columns" onClick={(event) => setVisibleColumnMenuEl(event.currentTarget)}>
              <Visibility />
            </IconButton>
          </Tooltip>
          <Menu
            id="simple-menu"
            anchorEl={visibleColumnMenuEl}
            keepMounted
            open={Boolean(visibleColumnMenuEl)}
            onClose={setVisibleColumns}
          >
            {getFlexibleColumns(columns).map((column, columnIndex) => {
              return (<MenuItem key={column.id} onClick={() => changeColumnVisiblity(columnIndex)}>
                <Checkbox checked={!column.hidden} />
                  <ListItemText primary={typeof column.label === "function"? <column.label /> : (column.label || "--")} />
                </MenuItem>)}
              )}
          </Menu>
        </Fragment>   
      )}
    </Toolbar>
  );
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
    },
    cellText: {
      cursor: 'default'
    },
    loading: {
      margin: 18,
    },
    noDataCell: {
      borderBottom: 0
    },
    componentCellLabel: {
      cursor: "default"
    }
  }),
);

export type TableQueryType = {
  offset: number,
  startCursor: any,
  endCursor: any,
  direction: "initial" | "previous" | "next",
  rowsPerPage: number,
  order: Order,
  orderBy: string
}

type EnhancedTableProps = {
  title: string;
  primaryKey: string;
  columns: TableColumn[];
  rows: any[];
  totalCount: number;
  fetchRows: (queryParam: TableQueryType) => void
  rowsPerPageOptions: number[];
  defaultOrderBy: string;
  disableSelection?: boolean;
  onFilterList?: () => void;
  onRowAdd?: () => void;
  onRowDelete?: (selected: string[]) => void;
  onSearchChange?: (query: string) => void;
  RowExpansionComponent?: React.FunctionComponent<any>;
  minWidth?: number;
  isLoading?: boolean;
  isDeleting?: boolean;
  loadingError?: string;
  tableProps?: any;
}

export const EnhancedTable: React.FC<EnhancedTableProps> = (props) => {
  const { title, columns, primaryKey, rows, totalCount, fetchRows, rowsPerPageOptions, isLoading, isDeleting, loadingError, defaultOrderBy, disableSelection, onFilterList, onRowAdd, onRowDelete, onSearchChange, RowExpansionComponent, minWidth, tableProps} = props;
  const classes = useStyles();
  const [allColumns, setAllColumns] = useState<TableColumn[]>(columns);
  const [visibleColumns, setVisibleColumns] = useState<TableColumn[]>(getVisibleColumns(columns));
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<string>(defaultOrderBy);
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions[0]);
  const [expandedRow, setExpandedRow] = useState<string>();

  useEffect(() => {
    setSelected(selected => {
      return selected.filter((selectedId) => {
        let matchFound = false;
        rows.forEach((row)=>{
          if(selectedId === row[primaryKey]){
            matchFound = true;
          }
        });
        return matchFound;
      });
    });
  }, [rows, primaryKey]);

  const handleRequestSort = (event: React.MouseEvent<unknown>, property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    fetchRows({
      offset: 0,
      startCursor: null,
      endCursor: null,
      direction: "initial",
      rowsPerPage,
      order: isAsc ? 'desc' : 'asc',
      orderBy: property
    });

    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
    setPage(0);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelecteds = rows.map((n) => n[primaryKey]);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event: React.MouseEvent<unknown>, primaryKey: string) => {
    if(expandedRow === primaryKey){
      setExpandedRow(undefined);
    }else{
      setExpandedRow(primaryKey);
    }
  }

  const handleCheckboxClick = (event: React.MouseEvent<unknown>, primaryKey: string) => {
    event.stopPropagation();
    const selectedIndex = selected.indexOf(primaryKey);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, primaryKey);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }
    setSelected(newSelected);
  };

  const handleColumsChange = (newColumns: TableColumn[]) => {
    setAllColumns(newColumns);
    setVisibleColumns(getVisibleColumns(newColumns));
  }

  const handleChangePage = (event: unknown, newPage: number) => {
    const direction = newPage > page ? "next" : "previous";
    let offset = direction === "next" ? (page + 1) * rowsPerPage : (page - 1) * rowsPerPage;
    if(offset < 0){
      offset = 0;
    } else if(offset > totalCount){
      offset = totalCount;
    }
    fetchRows({
      offset,
      startCursor: rows[ 0 ],
      endCursor: rows[ rows.length - 1 ],
      direction,
      rowsPerPage,
      order,
      orderBy
    });
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const rowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(rowsPerPage);
    fetchRows({
      offset: 0,
      startCursor: null,
      endCursor: null,
      direction: "initial",
      rowsPerPage,
      order,
      orderBy
    });
    setPage(0);
  };

  const isSelected = (primaryKey: string) => selected.indexOf(primaryKey) !== -1;

  let emptyRows = rowsPerPage - 2;
  if(!isLoading && !loadingError){
    emptyRows = rowsPerPage - rows.length;
  }

  useEffect(() => {
    fetchRows({
      offset: 0,
      startCursor: null,
      endCursor: null,
      direction: "initial",
      rowsPerPage,
      order,
      orderBy
    });
  }, []);

  return (
    <div className={classes.root}>
        <EnhancedTableToolbar  
          title={title}
          selected={selected}
          allSelected={selected.length === rows.length}
          columns={allColumns}
          updateColumns={handleColumsChange}
          onFilterList={onFilterList}
          onRowAdd={onRowAdd}
          onRowDelete={onRowDelete}
          onSearchChange={onSearchChange}
          isDeleting={isDeleting}
          page={page}
          changePage={handleChangePage}
         />
        <TableContainer>
          <Table
            aria-labelledby="tableTitle"
            aria-label="enhanced table"
            style={{minWidth: minWidth || 750}}
          >
            <EnhancedTableHead
              classes={classes}
              visibleColumns={visibleColumns}
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={rows.length}
              disableSelection={disableSelection}
            />
            <TableBody>
              {(isLoading || loadingError) && <TableRow>
                <TableCell colSpan={visibleColumns.length+(disableSelection?0:1)} align="center" className={classes.noDataCell}>
                  {isLoading && <CircularProgress className={classes.loading} />}
                  {loadingError && <Typography variant="h6" id="tableTitle" >{loadingError || "Failed to load data"}</Typography>}
                </TableCell>
              </TableRow>}
              {(rows.length === 0 && !isLoading && !loadingError) && <TableRow>
                <TableCell colSpan={visibleColumns.length+(disableSelection?0:1)} align="center">
                  <Typography variant="h6" id="tableTitle" >
                      No data available
                  </Typography>
                </TableCell>
              </TableRow>}
              {(!isLoading && !loadingError) && rows.map((row: any, index: number) => {
                  const isItemSelected = isSelected(row[primaryKey]);
                  return (
                    <Fragment key={row[primaryKey]}>
                      <TableRow
                        hover
                        onClick={(event) => handleClick(event, row[primaryKey])}
                        role="checkbox"
                        aria-checked={isItemSelected}
                        tabIndex={-1}
                        selected={isItemSelected}
                      >
                        {!disableSelection && <TableCell padding="checkbox">
                          <Checkbox
                            checked={isItemSelected}
                            inputProps={{ 'aria-labelledby': `table-data-id-${index}` }}
                            onClick={(event) => handleCheckboxClick(event, row[primaryKey])}
                          />
                        </TableCell>}
                        {visibleColumns.map((column, cellIndex) => {
                          return (
                            <TableCell 
                              key={column.id} 
                              padding="normal" 
                              id={`table-data-${column.id}-${index}`}
                              align={column.alignRight ? 'right' : 'left'}
                              >
                                { typeof column.CellComponent === "function" ?
                                  <column.CellComponent tableProps={tableProps} rowData={{...row}} cellData={(row[column.id] !== null && typeof row[column.id] === "object") ? {...row[column.id]} : row[column.id] } cellProps={column.cellProps} cellIndex={cellIndex} /> :
                                  <Typography variant="body2" className={classes.cellText}>{column.objectPath ? deepFind(row[column.id], column.objectPath) : row[column.id]}</Typography>
                                }
                            </TableCell> 
                          )
                        })}
                      </TableRow>
                      {RowExpansionComponent && expandedRow === row[primaryKey] && <TableRow >
                        <TableCell colSpan={visibleColumns.length+(disableSelection?0:1)} padding="none">
                          <RowExpansionComponent tableProps={tableProps} rowData={{...row}} />
                        </TableCell>
                      </TableRow>}
                    </Fragment>
                  );
                })}
              {emptyRows > 0 && (
                <TableRow style={{ height: 57 * emptyRows }}>
                  <TableCell colSpan={visibleColumns.length+(disableSelection?0:1)} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={rowsPerPageOptions}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
    </div>
  );
}