import React, { useEffect, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import InputLabel from '@material-ui/core/InputLabel';
import SendIcon from '@material-ui/icons/Send';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import ListItemText from "@material-ui/core/ListItemText";
import Checkbox from "@material-ui/core/Checkbox";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import ClearIcon from '@material-ui/icons/Clear';
import {FaFilter} from 'react-icons/fa';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { v4 as uuidv4 } from 'uuid';

export default function Loading({ childToParent }) {
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
            width: "50%",
            align: "center"
        }
    }));
    const ITEM_HEIGHT = 48;
    const ITEM_PADDING_TOP = 8;
    const MenuProps = {
        PaperProps: {
            style: {
                maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
                width: 250
            }
        },
        getContentAnchorEl: null,
        anchorOrigin: {
            vertical: "bottom",
            horizontal: "center"
        },
        transformOrigin: {
            vertical: "top",
            horizontal: "center"
        },
        variant: "menu"
    };

    const [error, setError] = useState(null);
    const [icon, setIcon] = React.useState([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [where, setWhere] = useState(false);
    const [applicationdata, setApplicationdata] = useState([]);
    const [selected, setSelected] = React.useState("");
    const [table, setTable] = React.useState("");
    const [tablesdata, setTablesData] = React.useState({});
    const [options, setOptions] = React.useState();
    const [application, setApplication] = React.useState("");
    const [columndata, setColumnData] = React.useState([]);
    const [permissions, setPermissions] = React.useState([]);
    const [opt, setOpt] = React.useState([]);
    const [columnValues, setColumnValues] = React.useState([]);
    const [whereValue, setWhereValue] = React.useState(null);
    const [appendValue, setAppendValue] = React.useState([
        { id: uuidv4(), value: [] },
    ]);
    const [inputFields, setInputFields] = React.useState([
        { id: uuidv4(), selectOption: '', columnName: '' },
    ]);
    const [bool, setBool] = React.useState([
        {
            and: false,
            or: false
        }
    ]) 
    const [runClick, setRunClick] = React.useState(true);

    let type = [];
    const isAllSelected =
        opt.length > 0 && icon.length === opt.length;
    const classes = useStyles();

    useEffect(() => { getFinalValue() });

    useEffect(() => {
        fetch("http://localhost:4000/application")
            .then(res => res.json())
            .then(
                (result) => {
                    setIsLoaded(true);
                    let tmpArray = [];
                    result.application.map(x => tmpArray.push(x.APPLICATIONSNAME))
                    setApplication(result.application)
                    setApplicationdata(tmpArray);
                    setTablesData(result.tables)
                    setColumnData(result.columns)
                    setPermissions(result.permissions)
                },
                (error) => {
                    setIsLoaded(true);
                    setError("Server is under maintenance. Please try again later!");
                }
            )
    }, [])

    console.log("Permissions:", permissions);

    const handleSubmit = (e) => {
        //e.preventDefault();
        getFinalValue();
        passData();
    }

    const getFinalValue = () => {
        var v;
        var temp;
        if(inputFields[0].option === 'IN')
        {
            let arr = `${inputFields[0].columnValue}`.split(",");
            temp = "";
            for(let a=0; a<arr.length-1; a++)
            {
                temp = temp+"'"+arr[a]+"',";
            }
            temp = temp+"'"+arr[arr.length-1]+"'";
            console.log('temp:', temp);
            v = `${inputFields[0].columnName} ${inputFields[0].option} (${temp})`;
            
        }
        //Starts With
        else if(inputFields[0].option === 'LIKE')
        {
            temp = `${inputFields[0].columnValue}`.toUpperCase();
            v = `UPPER(${inputFields[0].columnName}) ${inputFields[0].option} '${temp}%'`;
        }

        //Ends With
        else if(inputFields[0].option === 'LIKE ')
        {
            temp = `${inputFields[0].columnValue}`.toUpperCase();
            v = `UPPER(${inputFields[0].columnName}) ${inputFields[0].option} '%${temp}'`;
        }
        else{
            if(isNaN(`${inputFields[0].columnValue}`))
            {
                v = `${inputFields[0].columnName} ${inputFields[0].option} '${inputFields[0].columnValue}'`;
            }
            else
                v = `${inputFields[0].columnName} ${inputFields[0].option} ${inputFields[0].columnValue}`;
        }
   
        if(inputFields.length === 1)
        {
            if(inputFields[0].columnName === "")
            {
                setWhereValue(null);
            }
            else {
                setWhereValue(v);
                console.log("else if inside getFinalValue", v);
                console.log(inputFields);
            }
        }
        else {
            for (var i = 1; i < inputFields.length; i++) {
                v = v + `${inputFields[i].condition} ${inputFields[i].columnName} ${inputFields[i].option} '${inputFields[i].columnValue}'`;
            }
            setWhereValue(v);
            console.log("else inside getFinalValue", v);
        }       
        return whereValue;
        
    }

    const getColumnData = (event) => {
        var dummy = [];
        columndata.filter(i => i.TABLE_NAME === event.target.value).map(x => dummy.push((x.COLUMN_NAME).toUpperCase()));
        setOpt(dummy);
        console.log("opt:", opt);
    }

    const getTableData = (event) => {
        var application_id = application.filter(i => i.APPLICATIONSNAME === event.target.value).map(x => x.APPLICATIONID)
        tablesdata.filter(item => item.TABLE_ID === application_id[0]).map(x => type.push(x.TABLE_NAME))
        if (type != null) {
            setOptions(type.map((el) => <MenuItem value={el} key={el}>{el}</MenuItem>));
            console.log("options:", options);
        }
    }

    const getColumnValues = () => {
        setColumnValues(opt.map((el) => <MenuItem value={el} key={el}>{el}</MenuItem>))
        console.log("Column values:", columnValues);

    }

    const changeSelectOptionHandler = (event) => {
        setSelected(event.target.value);
        getTableData(event);
    };

    const changeTableOpetionHandler = (event) => {
        setTable(event.target.value);
        getColumnData(event);
        console.log('Table: ', table);
    };

    const handleChange = (event) => {
        const value = event.target.value;
        if (value[value.length - 1] === "all") {
            setIcon(icon.length === opt.length ? [] : opt);
            getColumnValues();
            setRunClick(false);
            return;
        }
        setIcon(value);
        setRunClick(false);
        getColumnValues()
        
    };

    const passData = () => {
        var result = {}
        console.log("wherevalue:", whereValue);
        if(whereValue !== null)
        {
        result.application = selected;
        result.table = table;
        result.columns = icon;
        result.whereValue=whereValue;
        result.clicked=true;
        result.handleSubmit = handleSubmit;
        result.permissions = permissions;
        }
        else{
            result.application = selected;
            result.table = table;
            result.columns = icon;
            result.clicked=true;
            result.handleSubmit = handleSubmit;
            result.permissions = permissions;
        }
        childToParent(result);
        console.log("ChildToParent:", result);
    }

    const handleChangeInput = (id, event) => {
        const newInputFields = inputFields.map(i => {
            if (id === i.id) {
                i[event.target.name] = event.target.value
            }
            return i;
        })
        console.log("handleChangeInput: ", newInputFields);
        setRunClick(true);
        setInputFields(newInputFields);
        console.log("handleChangeInput: ", inputFields);
        if(inputFields[inputFields.length-1].columnName  && inputFields[inputFields.length-1].columnValue && inputFields[inputFields.length-1].option)
        {
            setRunClick(false);
        }
    }

    var andDisabled = bool;

    const handleAndFields = () => {
        andDisabled[andDisabled.length-1].and = true;
        andDisabled.push({and: false, or: false});
        setInputFields([...inputFields, { id: uuidv4(), columnName: '', selectOption: '', condition: 'AND' }]);
        setBool(bool);
    }

    var orDisabled = bool;

    const handleORFields = () => {
        orDisabled[orDisabled.length-1].or = true;
        orDisabled.push({and: false, or: false});
        setInputFields([...inputFields, { id: uuidv4(), ColumnName: '', selectOption: '', condition: 'OR' }]);
        setBool(bool);
    }

    const handleRemoveFields = id => {
        const values = [...inputFields];
        const appvalue = [...appendValue]
        appvalue.splice(appvalue.findIndex(val => val.id === id), 1);
        values.splice(values.findIndex(value => value.id === id), 1);
        setInputFields(values);
        setAppendValue(appvalue);
    }

    if (error) {
        return <div>{error}</div>;
    } else if (!isLoaded) {
        return <div>Loading...</div>;
    } else {
        return (
            <div>
                <FormControl className={classes.formControl}>
                    <InputLabel id="demo-controlled-open-select-label">Application</InputLabel>
                    <Select onChange={changeSelectOptionHandler}>
                        {applicationdata.map((Applicationdata) => (
                            <MenuItem key={Applicationdata} value={Applicationdata}>
                                <ListItemText primary={Applicationdata} />
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl><br />
                <FormControl className={classes.formControl}>
                    <InputLabel id="demo-controlled-open-select-label">Table</InputLabel>
                    <Select onChange={changeTableOpetionHandler}>
                        {
                            options
                        }
                    </Select>
                </FormControl><br />
                <FormControl className={classes.formControl}>
                    <InputLabel id="mutiple-select-label">Columns</InputLabel>
                    <Select
                        labelId="mutiple-select-label"
                        multiple
                        value={icon}
                        onChange={handleChange}
                        renderValue={(icon) => icon.join(", ")}
                        MenuProps={MenuProps}
                    >
                        <MenuItem
                            value="all"
                            classes={{
                                root: isAllSelected ? classes.selectedAll : ""
                            }}
                        >
                            <ListItemIcon>
                                <Checkbox
                                    classes={{ indeterminate: classes.indeterminateColor }}
                                    checked={isAllSelected}
                                    indeterminate={
                                        icon.length > 0 && icon.length < opt.length
                                    }
                                />
                            </ListItemIcon>
                            <ListItemText
                                classes={{ primary: classes.selectAllText }}
                                primary="Select All"
                            />
                        </MenuItem>
                        
                        {opt[0] && opt.map((opt) => (
                            <MenuItem key={opt} value={opt}>
                                <ListItemIcon>
                                    <Checkbox checked={icon.indexOf(opt) > -1} />
                                </ListItemIcon>
                                <ListItemText primary={opt} />
                            </MenuItem>
                        ))
                        }
                    </Select>
                </FormControl>
                <OverlayTrigger placement="bottom" overlay={<Tooltip id="tooltip-filter">Filter By</Tooltip>}>
                    <FaFilter className={where ? "FilterT" : "FilterF"} onClick={(e) => setWhere(!where)}/>
                </OverlayTrigger>
                <br />
                {where && <FormControl className={classes.formControl}>
                    {inputFields[0] && inputFields.map((inputField, index) => (
                        <div key={inputField.id}>
                            <Select
                                name="columnName"
                                variant="outlined"
                                value={inputField.columnName}
                                onChange={event => handleChangeInput(inputField.id, event)}>
                                {
                                    columnValues
                                }
                            </Select>
                            <Select
                                name="option"
                                onChange={event => handleChangeInput(inputField.id, event)}>
                                <MenuItem value="="><>&nbsp;</>{" = "}</MenuItem>
                                <MenuItem value=">"><>&nbsp;</>{" > "}</MenuItem>
                                <MenuItem value="<"><>&nbsp;</>{" < "}</MenuItem>
                                <MenuItem value="IN"><>&nbsp;</>{" IN "}</MenuItem>
                                <MenuItem value="LIKE"><>&nbsp;</>{" Starts With "}</MenuItem>
                                <MenuItem value="LIKE "><>&nbsp;</>{" Ends With "}</MenuItem>
                            </Select>
                            <TextField
                                name="columnValue"
                                variant="outlined"
                                onChange={event => handleChangeInput(inputField.id, event)}
                            />

                            {bool[index] && <IconButton disabled={bool[index].and}
                                name="condition"
                                value="AND"
                                onChange={event => handleChangeInput(inputField.id, event)}
                                onClick={handleAndFields}
                            >
                                AND
                            </IconButton>}

                            {bool[index] && <IconButton disabled={bool[index].or}
                                onClick={handleORFields}
                            >
                                OR
                            </IconButton>}
                            <IconButton disabled={inputFields.length === 1} onClick={() => handleRemoveFields(inputField.id)}>
                                <ClearIcon />
                            </IconButton>
                        </div>
                    ))}
                </FormControl>
                }
                <div>
                    <br/>
                    <Button
                        variant="contained"
                        color="primary" onClick={handleSubmit} disabled={runClick}
                        type="submit"
                        endIcon={<SendIcon></SendIcon>}
                    >Run</Button>
                </div>
            </div>
        );
    }
}