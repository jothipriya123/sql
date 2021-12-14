import React from 'react';
import { FaSignInAlt, FaSignOutAlt, FaUserCircle} from "react-icons/fa";
import {Nav, Navbar, Tooltip, OverlayTrigger} from "react-bootstrap";
import logo from './dish_red.png';
import { IoPersonAdd } from "react-icons/io5";
import { getUser, removeUserSession } from './Utils/Common';
import { MdHome } from "react-icons/md";
function Navibar() {
    const user = getUser();
  return (
    <div >
      <Navbar className="NavColour" expand="lg" variant="dark">
              <Navbar.Brand href="/">&nbsp;&nbsp;&nbsp;&nbsp;<img src={logo} alt='Dish' style={{width:'40%', height:'30%', padding:'0%'}}/></Navbar.Brand>
              <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="mr-auto"></Nav>
                    {user !== null ?
                        <Nav>
                            <Nav.Link href="/">
                                <MdHome style={{fontSize: '25px'}}/>Home&nbsp;&nbsp;
                            </Nav.Link>
                            <Navbar.Text>
                                <FaUserCircle style={{fontSize: '23px'}}/>&nbsp;{user.name}&nbsp;&nbsp;
                            </Navbar.Text>
                            {user.isAdmin === "ADMIN" ?
                                <OverlayTrigger placement="bottom" overlay={<Tooltip id="tooltip-login">Register User</Tooltip>}>
                                <Nav.Link href="/registration">
                                    <IoPersonAdd style={{fontSize: '20px'}}/>&nbsp;&nbsp;
                                </Nav.Link>
                                </OverlayTrigger>
                                :
                                null
                            }
                            <OverlayTrigger placement="bottom" overlay={<Tooltip id="tooltip-login">Log Out</Tooltip>}>
                            <Nav.Link href="/login">
                                <FaSignOutAlt style={{fontSize: '20px'}} onClick={(e)=> {removeUserSession()}}/>&nbsp;&nbsp;
                            </Nav.Link>
                            </OverlayTrigger>
                        </Nav>
                    :
                        <Nav>
                            <Nav.Link href="/">
                                <MdHome style={{fontSize: '25px'}}/>Home&nbsp;&nbsp;
                            </Nav.Link>

                            <OverlayTrigger placement="bottom" overlay={<Tooltip id="tooltip-login">Log In</Tooltip>}>
                            <Nav.Link href="/login">
                                <FaSignInAlt style={{fontSize: '20px'}}/>&nbsp;&nbsp;
                            </Nav.Link>
                            </OverlayTrigger>
                        </Nav>
                    }
                    
                </Navbar.Collapse>
            </Navbar>
    </div>
  );
}

export default Navibar;
