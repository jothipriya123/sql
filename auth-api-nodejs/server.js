require('dotenv').config();
const express = require('express')
const oracledb = require('oracledb');
const app = express();
const port = process.env.PORT || 4000;
var password = "sa";
const cors = require('cors');
const jwt = require('jsonwebtoken');
const utils = require('./utils');

// enable CORS
app.use(cors());
var bodyParser = require('body-parser');
const { request } = require('express');
const { autoCommit } = require('oracledb');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

let userData = null;
var allUsers = [];
let table_name = null;
let app_name = null; 
let my_user = null;

async function testDatabase(req, res) {
  try {
    connection = await oracledb.getConnection({
      user: "sa",
      password: password,
      connectString: "tbss4db:1581/TBSS4"
    });

    console.log('connected to database');
    result = await connection.execute(`SELECT * FROM sqluserlist`);
    if (result.rows.length == 0) {
      return res.send('query send no rows');
    } else {
      allUsers = result.rows;
      return res.send(result.rows);
    }
    //app.listen();
  } catch (err) {
    return res.send(err.message);
  } finally {
    if (connection) {
      try {
        //await connection.close();
        console.log('close connection success');
      } catch (err) {
        console.error(err.message);
      }
    }
   
  }
}
app.get('/testconnect', function (req, res) {
  testDatabase(req, res);
})

//middleware that checks if JWT token exists and verifies it if it does exist.
//In all future routes, this helps to know if the request is authenticated or not.
app.use(function (req, res, next) {
  // check header or url parameters or post parameters for token
  var token = req.headers['authorization'];
  if (!token) return next(); //if no token, continue

  token = token.replace('Bearer ', '');
  jwt.verify(token, process.env.JWT_SECRET, function (err, user) {
    if (err) {
      return res.status(401).json({
        error: true,
        message: "Invalid user."
      });
    } else {
      req.user = user; //set the user to req so other routes can use it
      next();
    }
  });
});


// request handlers
app.get('/', (req, res) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Invalid user to access it.' });
  res.send('Welcome to the SQL update Dashboard! - ' + req.user.name);
});

// validate the user credentials
app.post('/validateuser', function (req, res) {
  const user = req.body.username;
  const pwd = req.body.password;

  for (let index = 0; index < allUsers.length; ++index) {
    let eachuser = allUsers[index]
    if(eachuser.NTLOGIN.toUpperCase() === user.toUpperCase()){
        my_user = eachuser;
        break;
    }
  }
   userData = my_user;
  // return 400 status if username/password is not exist
  if (user.length === 0 || pwd.length === 0) {
    return res.status(400).json({
      error: true,
      message: "Username or Password required."
    });
  }

  // return 401 status if the credential is not match.
  if (user.toUpperCase() !== userData.NTLOGIN.toUpperCase()) {
    return res.status(401).json({
      error: true,
      message: "Invalid Username."
    });
  }

  if (pwd !== userData.PASSWORD) {
    return res.status(401).json({
      error: true,
      message: "Wrong Password."
    });
  }

  // generate token
  const token = utils.generateToken(userData);
  // get basic user details
  const userObj = utils.getCleanUser(userData);
  // return the token along with user details
  return res.json({ user: userObj, token });
});


// verify the token and return it if it's valid
app.get('/verifyToken', function (req, res) {
  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token;
  if (!token) {
    return res.status(400).json({
      error: true,
      message: "Token is required."
    });
  }
  // check token that was passed by decoding token using secret
  jwt.verify(token, process.env.JWT_SECRET, function (err, user) {
    if (err) return res.status(401).json({
      error: true,
      message: "Invalid token."
    });

    // return 401 status if the oracleid does not match.
    if (user.oracleid !== userData.ORACLEID) {
      return res.status(401).json({
        error: true,
        message: "Invalid user."
      });
    }
    // get basic user details
    var userObj = utils.getCleanUser(userData);
    return res.json({ user: userObj, token });
  });
});

var result_data = {}

async function registerData(req, res) {

  const {employeeID,firstname,lastname,emailID,accesstype,oracleID,password}= req.body.formValues;   
  oracledb.getConnection({
    user: "sa",
    password: "sa",
    connectString: "tbss4db:1581/TBSS4"
  }, function(err,con){
    if(err){
      console.log("Error...")
      res.send('db con error');
    }
    else{
      console.log("Connected....")
      var q="insert into sqluserlist values('"+employeeID+"','"+firstname+"','"+lastname+"','"+emailID+"','"+password+"','"+accesstype+"','"+oracleID+"')";
      con.execute(q,[],{autoCommit:true}, function(e,s){
        if(e){
          res.send(e);
        }
        else{
          console.log(s)
          res.send(s);
        }
      })
    }
  });
}

async function displaydata(req, res) {

  try {
    connection = await oracledb.getConnection({
      user: "sa",
      password: password,
      connectString: "tbss4db:1581/TBSS4"
    });

    console.log('connected to database');

    var query = ""
    var table = req.body.tables;
    table_name = table;
    var schema = "";
    var application = `${req.body.processes}`;
    app_name = application;
    var columns = req.body.columns;
    var condition = req.body.condition;

    if (application === "ABP") {
      schema = "pdcustc"
    }
    else if (application === "CRM") {
      schema = "pcrm"
    }
    else if (application === "OMS") {
      schema = "poms"
    }
    if (condition === undefined) {
      query = `select ${columns} from ${table}`;
    }
    else {
      query = `select ${columns} from ${table} where ${condition}`;
    }
    result = await connection.execute(query, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
    if (result.rows.length == 0) {
      return res.send('No records found');
    } else {      
      res.send(result.rows);
    }
  }
  catch (err) {
    return res.send(err.message);
  } finally {
    if (connection) {
      try {
        await connection.close();
        console.log('close connection success');
      } catch (err) {
        console.error(err.message);
      }
    }

  }
}
async function application(req, res) {

  try {
    connection = await oracledb.getConnection({
      user: "sa",
      password: password,
      connectString: "tbss4db:1581/TBSS4"
    });

    console.log('connected to database');
    result = await connection.execute(`select * from applications`, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
    if (result.rows.length == 0) {
      return res.send('No records found');
    } else {
      result_data.application = result.rows;
      try {
        result = await connection.execute(`select DISTINCT table_id, table_name from test_tables`, [], {})
        if (result.rows.length == 0) {
          return res.send('No records found');
        }
        else {
          result_data.tables = result.rows;
          try {
            result = await connection.execute(`select table_name, column_name from test_tables_column`, [], {})
            if (result.rows.length == 0) {
              return res.send('No records found');
            }
            else {
              result_data.columns = result.rows;
              try {
                result = await connection.execute(`select table_name, select_status, update_status, delete_status from test_tables`, [], {})
                if (result.rows.length == 0) {
                  return res.send('No records found');
                }
                else {
                  result_data.permissions = result.rows;
                  console.log("result_data:", result_data);
                  return res.send(result_data);
                }
              } catch (err) {
                return res.send(err.message);
              }
            }
          } catch (err) {
            return res.send(err.message);
          }
        }
      } catch (err) {
        return res.send(err.message);
      }
    }
  }
  catch (err) {
    return res.send(err.message);
  } finally {
    if (connection) {
      try {
        await connection.close();
        console.log('close connection success');
      } catch (err) {
        console.error(err.message);
      }
    }

  }
}

let update_result = [];

async function updateData(req, res) {
  const updatedRecords = req.body.updatedRecords;
  const seqNo = req.body.seqNo;
  var table = table_name;
  var u_columns = Object.keys(updatedRecords);
  var u_values = Object.values(updatedRecords);
  let update_str = '';
  let hist_rec = '';
  let updated_rec = '';
  
  for(var i=0; i< Object.keys(updatedRecords).length-1; i++)
  {
    update_str= update_str+''+u_columns[i]+"='"+u_values[i]+"',";
  }
  update_str= update_str+''+u_columns[Object.keys(updatedRecords).length-1]+'='+"'"+u_values[Object.keys(updatedRecords).length-1]+"'";
  
  oracledb.getConnection({
    user: "sa",
    password: "sa",
    connectString: "tbss4db:1581/TBSS4"
  }, async function(err,con){
    if(err){
      console.log("Error...")
      res.send('db con error');
    }
    else{
      console.log("Connected....")   
      result = await con.execute(`select * from ${table} where seq_no = ${seqNo}`, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
      if (result.rows.length == 0) {
        return res.send('No records found');
      } else {
        hist_rec = JSON.stringify(result.rows[0]);
        var date = new Date().toLocaleString();
        try {
          var q=`update ${table} set ${update_str} where seq_no = ${seqNo}`;
          var query = q;
          con.execute(q,[], {autoCommit:true},function(e,s){
            if(e){
              res.send(e);
            }
            else{
              update_result.update = s;
          }
        })
      }catch (err) {
        return res.send(err.message);
      }finally {
        if(con)
        {
          try{
            await con.close();
            console.log('Connection closed');
          } catch (err) {
            console.log('Error closing connection', err);
          }         
        }
      }
      oracledb.getConnection({
        user: "sa",
        password: "sa",
        connectString: "tbss4db:1581/TBSS4"
      }, async function(err,con){
        if(err){
          console.log("Error...")
          res.send('db con error');
        }
        else{
          console.log("Connected....")
              try {               
                result = await con.execute(`select * from ${table} where seq_no = ${seqNo}`, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });

                var temp=null;
                if(update_result.update.rowsAffected === 0){
                  temp="UNSUCCESSFUL";
                }
                else
                {
                  temp="SUCCESSFUL";
                }

                if (result.rows.length == 0) {
                  return res.send('No records found');
                } else {
                  updated_rec = JSON.stringify(result.rows[0]);
                  try{
                    var q=`insert into history values('${seqNo}','${app_name}','${table}','Update','${hist_rec}',TO_DATE('${date}', 'mm/dd/yyyy, hh:mi:ss am'), ${my_user.IDSQLUSER}, '${temp}', '${updated_rec}', q'${JSON.stringify(query)}', '${JSON.stringify(update_result.update)}')`;
                    con.execute(q,[],{autoCommit:true}, function(e,s){
                      if(e){
                        res.send(e);
                      }
                      else{
                        update_result.insert = s;
                        res.send(update_result.update);
                      }
                    })
                  }catch (err) {
                    return res.send(err.message);
                  }
                }             
          
            }catch (err) {
              return res.send(err.message);
            }
          }
        })
      }
    }
  });
}

async function deleteData(req, res) {
  const seqNo = req.params.seqNo;
  var table = table_name;   
  oracledb.getConnection({
    user: "sa",
    password: "sa",
    connectString: "tbss4db:1581/TBSS4"
  },async function(err,con){
    if(err){
      console.log("Error...")
      res.send('db con error');
    }
    else{
      console.log("Connected....")
      result = await con.execute(`select * from ${table} where seq_no = ${seqNo}`, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
      if (result.rows.length == 0) {
        return res.send('No records found');
      } else {
        hist_rec = JSON.stringify(result.rows[0]);
        var date = new Date().toLocaleString();
        try {
          var q=`delete from ${table} where seq_no = ${seqNo}`;
          con.execute(q,[],{autoCommit:true}, function(e,s){
            if(e){
              res.send(e);
            }
            else{
              update_result.update = s;
              try {
                var temp=null;
                if(s.rowsAffected === 0){
                  temp="UNSUCCESSFUL";
                }
                else
                {
                  temp="SUCCESSFUL";
                }
                var q=`insert into history values('${seqNo}','${app_name}','${table}','Delete','${hist_rec}',TO_DATE('${date}', 'mm/dd/yyyy, hh:mi:ss am'), ${my_user.IDSQLUSER}, '${temp}')`;
                con.execute(q,[],{autoCommit:true}, function(e,s){
                  if(e){
                    res.send(e);
                  }
                  else{
                    update_result.insert = s;
                    res.send(update_result.update);
                  }
                })
              }catch (err) {
                return res.send(err.message);
              }
            }
          })
          
        }catch (err) {
          return res.send(err.message);
        }
      }
    }
  });
}

app.post('/register', (req, res) => {  
  registerData(req, res);
})

app.get('/application', function (req, res) {
  application(req, res);
});

app.get('/run', function (seqNo, table) {
  runQuery(seqNo, table);
});

app.post('/select', (req, res) => {
  displaydata(req, res);
})

app.put('/update', (req, res) => {
  updateData(req, res);
})

app.delete('/delete/:seqNo', (req, res) =>{
  deleteData(req, res);
})

app.listen(port, () => {
  console.log('Server started on: ' + port);
});
