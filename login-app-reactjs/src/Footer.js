import React from 'react';
import { MdCopyright } from "react-icons/md";
import {Nav, Navbar, Container } from "react-bootstrap";

function Footer() {
  return (
    <div>
        <Container fluid>
            <Navbar className='Footer'>
                <Nav className="mr-auto"></Nav>
                <Nav>
                  <Navbar.Text>
                    <MdCopyright/>{"2021 Okta, Inc."}&nbsp;{"|"}&nbsp;{"Privacy"}
                  </Navbar.Text>
                </Nav>
            </Navbar>   
        </Container>
        <br/>
    </div>
  );
}

export default Footer;
