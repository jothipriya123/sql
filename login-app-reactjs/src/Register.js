import React, { useState } from 'react';
import { Grid, TextField, Button, MenuItem, InputLabel, Select, FormControl, makeStyles } from '@material-ui/core';
import SendIcon from '@material-ui/icons/Send';
import axios from 'axios';


const useStyles = makeStyles((theme) => ({
    formControl: {
        minWidth: 200,
    }
}))

export default function Register() {
    const classes = useStyles();
    const defaultValues = {
        firstname: "",
        lastname: "",
        emailID: "",
        employeeID:"",
        accesstype: "",
        oracleID: "",
        password: "",
        retypepassword: "",
    };

    const [responsemsg, setResponseMsg] = React.useState([]);
    const [errormsg, setErrorMsg] = React.useState([]);
    const [formValues, setFormValues] = useState(defaultValues);
    const [passwordError, setPasswordError] = useState("")
    const [confirmPasswordError, setConfirmPasswordError] = useState("")
    const [validatedpassword, setValidatedPassword] = useState(false)
    const [validatedConfirmPassword, setvalidatedconfirmpassword] = useState(false)
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormValues({
            ...formValues,
            [name]: value,
        });
        if (name === "password") {
            validatePassword();
        }
        if (name === "retypepassword") {
            validateConfirmPassword();
        }
    };

    const validatePassword = () => {
        var regex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#-._\\\\/()$%^&*:;'}{|\"+,<=>\\[\\]?^~`])(?=.{8,128})");

        setPasswordError(
            regex.test(formValues.password) ? setValidatedPassword(true) :
                'Not a valid password')

    }
    const validateConfirmPassword = () => {

        setConfirmPasswordError((formValues.retypepassword === formValues.password) ?
            setvalidatedconfirmpassword(true) : 'Should match with password')
    }

    const getURL = () => {
        let url = (`http://localhost:4000/register`)
        return url;
    }
    
    const handleSubmit = () => {
        var bool = false;
        if(formValues.firstname !== "" && formValues.lastname !== "" && formValues.emailID !== "" && formValues.employeeID !== "" && formValues.accesstype !== "" && formValues.oracleID !== "" && formValues.password !== "" && formValues.retypepassword !== "" && formValues.retypepassword === formValues.password)
        {
            if(new RegExp(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,15}/g).test(formValues.emailID))
            {       
                axios.post(getURL(), { formValues }, {
                    'Content-Type': 'application/json',
                }).then(function (response) {
                    if (response.status >= 400) {
                        throw new Error("Bad response from server");
                    }
                    return response.data;
                }).then(function (data) {           
                alert("Registered sucessfully");
                }).catch(err => {
                    bool = true;
                    setErrorMsg(err.response);
                })
                bool && alert("Something went wrong! Please try again later")
            }
            else
                alert("Invalid Email address")
        }
        else if(formValues.password !== "" && formValues.retypepassword !== "" && formValues.retypepassword !== formValues.password) {
            formValues.retypepassword = "";
            alert("Password didn't matched");
        }
        else
            alert("Please complete the form before submission");
    }

    return (
        <Grid container centered>
          <form className="Register">
                <TextField
                    required
                    id="outlined-required"
                    label="First Name"
                    name="firstname"
                    value={formValues.firstname}
                    onChange={handleInputChange}
                />&emsp;
                <TextField
                    required
                    id="outlined-required"
                    label="Last Name"
                    name="lastname"
                    value={formValues.lastname}
                    onChange={handleInputChange}
                />
                <br/>
                <TextField
                    required
                    fullWidth
                    id="outlined-required"
                    type="email"
                    label="Email ID"
                    name="emailID"
                    value={formValues.emailID}
                    onChange={handleInputChange}
                /><br/>
                
                <TextField
                    required
                    id="outlined-required"
                    label="OracleID"
                    name="oracleID"
                    value={formValues.oracleID}
                    onChange={handleInputChange}
                />
                <br/>
                <TextField
                    required
                    id="outlined-required" type=""
                    label="Employee ID"
                    name="employeeID"
                    value={formValues.employeeID}
                    onChange={handleInputChange}
                /><br/>
                <FormControl className={classes.formControl}>
                    <InputLabel id="demo-simple-select-label">Access Type</InputLabel>
                    <Select
                        required
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={formValues.accesstype}
                        label="Access Type"
                        name="accesstype"
                        onChange={handleInputChange}
                    >
                        <MenuItem value="ADMIN">Admin</MenuItem>
                        <MenuItem value="READ-ONLY">Guest User</MenuItem>
                        <MenuItem value="REGISTERED">Registered User</MenuItem>
                    </Select>
                </FormControl>
                <br/>
                <TextField
                    required
                    id="outlined-password-input"
                    label="Password"
                    type="password"
                    autoComplete="current-password"
                    name="password"
                    value={formValues.password}
                    onChange={handleInputChange}
                />
                <span><div style={{fontSize:'12px', color:'red'}}>{passwordError}</div></span>
                <TextField
                    required
                    id="outlined-password-input"
                    label="Retype Password"
                    type="password"
                    name="retypepassword"
                    autoComplete="current-password"
                    onChange={handleInputChange}
                    onBlur={validateConfirmPassword}
                />
                <span><div style={{fontSize:'12px', color:'red'}}>{confirmPasswordError}</div></span>
                <br />
                <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    endIcon={<SendIcon></SendIcon>}
                    onClick={handleSubmit}
                >Submit</Button>
          </form>
        </Grid>
    );
}