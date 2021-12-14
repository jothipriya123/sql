import React from 'react';
import {Card, Button, Nav } from "react-bootstrap";
function Dashboard(props) {
  const buttonClick = () => {   
    props.history.push('/category');
  }

  return (
    <div style= {{fontFamily:"Arial, Helvetica, sans-serif"}}>
      <Card border='light' className = 'TabContainer'>
        <Card.Header>
          <Nav variant="tabs" defaultActiveKey="/dashboard">
            <Nav.Item>
              <Nav.Link href="/dashboard">Application</Nav.Link>
            </Nav.Item>
          </Nav>
        </Card.Header>
        <Card.Body>              
          <Card.Text>
            <div style = {{fontFamily:"Arial, Helvetica, sans-serif", fontSize: '14px'}}>
              <pre style = {{fontFamily:"Arial, Helvetica, sans-serif", paddingTop: '1%', paddingBottom: '5px'}}><Button style={{fontSize: '16px'}} variant="secondary" onClick={(e) => buttonClick(e)}>{"SQL Update \nApplication"}</Button></pre>
              <pre style = {{fontFamily:"Arial, Helvetica, sans-serif", fontSize: '14px'}}>{"SQL Update Process \n  application"}</pre> 
            </div>
          </Card.Text>
        </Card.Body>
      </Card>
    </div>
  );
}

export default Dashboard;
