import React from "react"
import { connect } from "react-redux"
import { Route, Redirect } from "react-router-dom"

const PrivateRoute = ({ component: Component, currentUser, ...rest }) => {
    const user = currentUser.currentUser
    return (
        <Route {...rest} render={(props) => (
            user !== null ?
                <Component {...props} user={user} /> :
                <Redirect to="/" />
        )} />
    )
}

const mapStateToProps = state => ({
    currentUser: state.authUser
})

export default connect(mapStateToProps, null)(PrivateRoute)