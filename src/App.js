import React from "react"
import Toolbar from "./Components/Toolbar"
import { auth, firestore } from "./config"
import { connect } from "react-redux"
import { Switch, Route } from "react-router-dom"
import AddCourse from "./Components/addCourse"
import Home from "./Components/Home"
import Dashboard from "./Components/dashboard"
import PrivateRoute from "./Components/PrivateRoute"
import AddRequirement from "./Components/addRequirement"
import MyRequest from "./Components/myRequests"
import { setCurrentUser } from "./Redux/Reducers/setCurrentUser"
import { courseAction } from "./Redux/Reducers/courseAction"
import MyCourse from "./Components/myCourse"
import firebase from "./config"

class App extends React.Component {
  unsubscribe = null
  componentDidMount() {
    const { setCurrentUser } = this.props
    this.unsubscribe = auth.onAuthStateChanged(async userObject => {
      if (userObject) {
        const ref = firestore.collection("users").doc(`${userObject.uid}`)
        console.log(ref);
        ref.get().then(doc => {
          if (!doc.exists) {
            console.log(ref);
            ref.set({
              displayName: userObject.displayName,
              photoURL: userObject.photoURL,
              email: userObject.email,
              createdAt: firebase.firestore.FieldValue.serverTimestamp(),
              coursesHaveList: [],
              coursesWantList: [],
              uid: userObject.uid
            })
          }
        })
        ref.onSnapshot(snapShot => {
          setCurrentUser({
            id: snapShot.id,
            ...snapShot.data()
          })
        })
        const { allCourseName } = this.props.courseList
        const { courseAction } = this.props
        if (allCourseName.length === 0) {
          let allCourseNames = []
          firestore.collection("courses").get().then(Snapshot => Snapshot.forEach(doc => {
            allCourseNames.push(doc.data().courseName)
          }))
          courseAction(allCourseNames)
        }
      }
    })
  }

  componentWillUnmount() {
    this.unsubscribe()
  }
  render() {
    return (
      <div>
        <Toolbar />
        <Switch>
          <PrivateRoute path="/add-requirement" component={AddRequirement} />
          <PrivateRoute path="/dashboard" component={Dashboard} />
          <Route path="/add-course" component={AddCourse} />
          <PrivateRoute path="/my-requests" component={MyRequest} />
          <PrivateRoute path="/my-course" component={MyCourse} />
          <Route exact path="/" component={Home} />
        </Switch>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  user: state.authUser,
  courseList: state.courseReducer
})

const mapDispatchToProps = dispatch => ({
  setCurrentUser: user => dispatch(setCurrentUser(user)),
  courseAction: courses => dispatch(courseAction(courses))
})

export default connect(mapStateToProps, mapDispatchToProps)(App)