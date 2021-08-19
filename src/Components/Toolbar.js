import React from "react"
import { Link, NavLink, Redirect, withRouter } from "react-router-dom"
import { connect } from "react-redux"
import { auth } from "../config"
import { googleAuth } from "../config"


class Toolbar extends React.Component {
    constructor() {
        super()
        this.state = {
            isSelected: 2
        }
    }
    render() {
        return (
            <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignSelf: "center", margin: "20px" }}>
                    <i style={{ marginRight: "10px" }} className="fa fa-exchange"></i>
                    <div style={{ fontFamily: "Kurale" }} >COURSE SWAPPER</div>
                </div>
                {
                    this.props.user.currentUser === null ?
                        <div style={{ backgroundColor: "#DB4437", margin: "20px", fontSize: "15px", padding: "5px 10px 5px 10px", borderRadius: "3px" }}>
                            <Link to="/dashboard" onClick={googleAuth} style={{ textDecoration: "none", color: "white" }}>LOGIN</Link>
                        </div> :
                        <div style={{ display: "flex" }}>
                            <NavLink activeClassName="tab-classes" to="/dashboard" style={{ fontSize: "15px", margin: "20px", color: "white", textDecoration: "none" }}>
                                DASHBOARD
                            </NavLink>
                            <NavLink activeClassName="tab-classes" to="/my-course" style={{ fontSize: "15px", margin: "20px", color: "white", textDecoration: "none" }}>
                                MY COURSES
                            </NavLink>
                            <NavLink activeClassName="tab-classes" to="/my-requests" style={{ fontSize: "15px", margin: "20px", color: "white", textDecoration: "none" }}>
                                MY REQUESTS
                            </NavLink>
                            <Link to="/" onClick={() => auth.signOut()} style={{ fontSize: "15px", margin: "20px", color: "white", textDecoration: "none" }}>
                                LOG OUT
                            </Link>
                        </div>
                }
            </div >
        )
    }
}

const mapStateToProps = state => ({
    user: state.authUser
})

export default connect(mapStateToProps, null)(withRouter(Toolbar))