import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { setUserSession } from './Utils/Common';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import logo from './dish.jpg';

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),  
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));


function Login(props) {
  const classes = useStyles();
  const [loading, setLoading] = useState(false);
  const username = useFormInput('');
  const password = useFormInput('');
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:4000/testconnect")
    .then(res => console.log(res))
    .catch(err => console.log(err))
  },[])

  const handleLogin = () => {
    setError(null);
    setLoading(true);
    console.log("entered user",username.value,password.value);
    axios.post('http://localhost:4000/validateuser', { username: username.value, password: password.value }).then(response => {
      setLoading(false);
      setUserSession(response.data.token, response.data.user);
      props.history.push('/dashboard');
      window.location.reload();
    }).catch(error => {
      setLoading(false);
      if (error.response && error.response.status === 401) setError(error.response.data.message);
      else setError("Something went wrong. Please try again later.");
    });
  }

  return (
    <div>
    <Container component="main" maxWidth="xs" className="Login">
      <CssBaseline />
      <div className={classes.paper}>
      <img src={logo} alt="Logo" style={{ width: 150 }}/> <br/>
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        <form className={classes.form} noValidate >
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="username"
            label="username"
            name="username"
            autoFocus
            type="text" {...username} autoComplete="username"
          />
           <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="password"
            label="password"
            name="password"
            type="password" {...password} autoComplete="password"
          />
          <FormControlLabel
            control={<Checkbox value="remember" color="primary" />}
            label="Remember me"
          />
          {error && <><small style={{ color: 'red' }}>{error}</small><br /></>}<br />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            value={loading ? 'Loading...' : 'Login'} onClick={handleLogin} disabled={loading}
          >Login</Button>
          <Grid container>
            <Grid item xs>
              <Link href="#" variant="body2">
                Need help Signing In?
              </Link>
            </Grid>
          </Grid>
          </form> 
      </div>      
    <br />
    </Container>
    </div>
  );
}

const useFormInput = initialValue => {
  const [value, setValue] = useState(initialValue);

  const handleChange = e => {
    setValue(e.target.value);
  }
  return {
    value,
    onChange: handleChange
  }
}

export default Login;