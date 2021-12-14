import React, {useEffect, useState} from 'react';
import { makeStyles, styled } from '@material-ui/core/styles';
import { Grid, Table, TableBody, TableCell, TableHead, TableRow, Paper, TableContainer, TablePagination } from '@material-ui/core';
import { Button, Modal } from 'react-bootstrap';
import TextField from '@material-ui/core/TextField';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import axios from 'axios';
import Loading from './Loading'
import { getUser } from './Utils/Common';

const user = getUser();
const useStyles = makeStyles((theme) => ({
    '@global': {
        body: {
            backgroundColor: 'LightYellow',
        },
    },
    formControl: {
        margin: theme.spacing(1),
        minWidth: 300,
    },
    indeterminateColor: {
        color: "#f50057"
    },
    selectAllText: {
        fontWeight: 500
    },
    selectedAll: {
        backgroundColor: "rgba(0, 0, 0, 0.08)",
        "&:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.08)"
        }
    },
    root: {
        '& > *': {
            margin: theme.spacing(1),
        },
    },
    table: {
        align: "center",
    },
    tableContainer: {
        borderRadius: 5,
        margin: '10px 10px',
        maxWidth: '75%',
    },

    tableHeaderCell: {
        fontWeight: 'bold',
        backgroundColor: theme.palette.common.black,
        color: theme.palette.getContrastText(theme.palette.common.black),
    },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
    // hide last border
    '&:last-child td, &:last-child th': {
      border: 0,
    },
}));
  
let record = [];
export default function Category({ Applicationdata }) {
    const classes = useStyles();
    const [responsemsg, setResponseMsg] = React.useState([]);
    const [errormsg, setErrorMsg] = React.useState([]);
    const [clicked, setClicked] = React.useState(false);
    const [editOp, setEditOp] = React.useState(false);
    const [deleteOp, setDeleteOp] = React.useState(false);
    var columnHeader = null;
    const [loadingData, setLoadingData] = React.useState('');
    var loadData = null;

    const [show, setShow] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const handleClose = () => setShow(false);

    const [seqNo, setSeqNo] = useState(0);
    const [records, setRecords] = useState([]);
    const [updatedRecords, setUpdatedRecords] = useState([]);

    useEffect(() => {
        setRecords(record);
        console.log("Records:", records);
    },[record,])

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setRecords({
            ...records,
            [name]: value,
        })

        setUpdatedRecords({
            ...updatedRecords,
            [name]: value,
        })
        console.log("updatedRecords", updatedRecords);
    }
    
    const handleDelete = (item) => 
    {
        setSeqNo(item.SEQ_NO);
        setShowDelete(true);
    }

    const handleEdit = (item) => 
    {
        record=item;
        setSeqNo(item.SEQ_NO);
        setShow(true);
    }
    const handleDeleteClose = () => setShowDelete(false);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const handleChangePage = (event, newPage) => {setPage(newPage)}
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(event.target.value);
        setPage(0);
    }

    const childToParent = (childdata) => {
        loadData = childdata;
        setLoadingData(childdata);
        callAPI();
        setClicked(true);
        console.log("loadData:", loadData);
    }

    useEffect(() => {
        if(loadingData.permissions && user)
        { 
            for(var i=0; i<loadingData.permissions.length; i++)
            {
                if(loadingData.permissions[i].TABLE_NAME === loadingData.table)
                {
                    if(loadingData.permissions[i].UPDATE_STATUS === "ACTIVE")
                    {
                        setEditOp(true);
                    }
                    if(loadingData.permissions[i].DELETE_STATUS === "ACTIVE")
                    {
                        setDeleteOp(true);
                    }
                }
            }

            if(user.isAdmin === 'READ-ONLY')
            {
                setEditOp(false);
                setDeleteOp(false);
            }
        }

    })
    const getURL = () => {
        let url = (`http://localhost:4000/select`)
        return url;
    }
    
    const callAPI = () => {
        axios.post(getURL(), { processes: loadData.application, tables: loadData.table, columns: loadData.columns, condition: loadData.whereValue }, {
            'Content-Type': 'application/json',
        }).then(function (response) {
            if (response.status >= 400) {
                throw new Error("Bad response from server");
            }
            return response.data;
           
        }).then(function (data) {
            setResponseMsg(data);
        }).catch(err => {
            setErrorMsg(err.response);
        })
    }

    const editRow = () => {       
        axios.put(`http://localhost:4000/update`, { updatedRecords, seqNo }, {
            'Content-Type': 'application/json',
        }).then(function (response) {
            if (response.status >= 400) {
                throw new Error("Bad response from server");
            }
            return response.data;
        }).then(function (data) {
            handleClose();
            loadingData.handleSubmit(); 
            if(data.rowsAffected === 0)
            {
                alert("Update operation failed! Please try again later.");
            }
            else{            
                alert("Updated sucessfully");
            }
        }).catch(err => {
            setErrorMsg(err.response);
        })

    }

    const deleteRow = () => {
        axios.delete(`http://localhost:4000/delete/${seqNo}`, {
            'Content-Type': 'application/json',
        }).then(function (response) {
            if (response.status >= 400) {
                throw new Error("Bad response from server");
            }
            return response.data;
        }).then(function (data) {       
            handleDeleteClose();
            loadingData.handleSubmit();   
            if(data.rowsAffected === 0)
            {
                alert("Delete operation failed! Please try again later.");
            }
            else{            
                alert("Deleted sucessfully");
            } 
        }).catch(err => {
            console.log(err.response);
        })
    }

    const generateHeader = () => {
        columnHeader = loadingData.columns;
        let head = [];
        for (var i = 0; i < columnHeader.length; i++) {
            head.push(<TableCell className={classes.tableHeaderCell} variant="head" style={{ width: '10%' }} id={columnHeader[i]}>{columnHeader[i]}</TableCell>)
        }
        if(editOp || deleteOp){
            head.push(<TableCell className={classes.tableHeaderCell} variant="head" style={{ width: '10%' }} id="operations">{"OPERATIONS"}</TableCell>)
        }
        return head;
    }

    const filterObjsInArr = (arr, selection) => {
        const filteredArray = [];
        arr[0] && arr.map((obj) => {
            const filteredObj = {};
            for (let key in obj) {
                if (selection.includes(key)) {
                    filteredObj[key] = obj[key];
                };
            };
            filteredArray.push(filteredObj);
            console.log("filteredObj", filteredObj);   
            return null;
        })
        return filteredArray;
    }
    const displayTable = () => {
        return(
            clicked && Array.isArray(responsemsg) ?
                
                <Grid xs={12} md={7}
                    align='center'
                    padding='2%'
                    
                >
                    <br/>
                    <TableContainer component={Paper} className={classes.tableContainer}>
                    <Table className={classes.table} aria-label="simple table" component={Paper}>
                        <TableHead>
                            <TableRow>
                                {generateHeader()}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filterObjsInArr(responsemsg, columnHeader) && filterObjsInArr(responsemsg, columnHeader).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((item, index) => (
                                <StyledTableRow key={item.id}>
                                    {Object.values(item).map((val) => (
                                        <>
                                        <TableCell style={{ width: '10%' }}>{val}</TableCell>
                                        </>
                                    ))}
                                    {(editOp || deleteOp) && <TableCell style={{ width: '10%' }}>
                                        {editOp && <EditIcon onClick={(e) => handleEdit(item)}/>}&emsp;
                                        {deleteOp && <DeleteIcon onClick={(e) => handleDelete(item)}/>}
                                    </TableCell>}
                                </StyledTableRow>
                            ))}
                        </TableBody>
                    </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[2, 5, 10]}
                        component="div"
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onChangePage={handleChangePage}
                        onChangeRowsPerPage={handleChangeRowsPerPage}
                        count = {filterObjsInArr(responsemsg, columnHeader).length}
                    />
                </Grid> 
                :
                <Grid>
                    <p>{responsemsg}</p>
                </Grid>
            
        );
    }
    return (
    <>
    <br/>
    <Grid container spacing= {2} className = {clicked ? "Category" : null}>
        <Grid xs={12} md={5} 
            spacing={2}
            direction="column"
            alignItems="center"
            justify="center"
            style={{ minHeight: '70vh', padding: '2%'}}
            className = {clicked ? null : "Category"}
        >
            {
                <Loading childToParent={childToParent } />
            }
        </Grid>

        {displayTable()}   

    </Grid>
    <Modal
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
        centered
    >
        <Modal.Header closeButton>
            <Modal.Title>Edit Record</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            Please update the required details below!
            {records && Object.keys(records).map((rec, index) => (
            <>
                <br/>
                <form>
                    <TextField
                        required
                        id="outlined-required"
                        label={Object.keys(records)[index]}
                        name={Object.keys(records)[index]}
                        value={Object.values(records)[index]}
                        onChange={handleInputChange}
                    />
                </form>
            </>
            ))} 
        </Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
                Close
            </Button>
            <Button variant="primary" onClick={editRow}>Submit</Button>
        </Modal.Footer>
    </Modal>
    <Modal
        show={showDelete}
        onHide={handleDeleteClose}
        backdrop="static"
        keyboard={false}
        centered
    >
        <Modal.Header closeButton>
            <Modal.Title>Delete Record</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            Are you sure, you want to delete the records from the database?
        </Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={handleDeleteClose}>
                Close
            </Button>
            <Button variant="danger" onClick={deleteRow}>Delete</Button>
        </Modal.Footer>
    </Modal>
    </>
    );
}
