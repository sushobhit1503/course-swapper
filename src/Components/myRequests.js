import React from "react"
import { firestore } from "../config"
import { connect } from "react-redux"
import { Table, Button } from "react-bootstrap"
import firebase from "../config"

class myRequests extends React.Component {
    constructor() {
        super()
        this.state = {
            allRequests: [],
            haveCourseID: "",
            studentNameID: "",
            isWantCourse: false,
            loading: false,
            isError: ""
        }
    }
    componentDidMount() {
        const { displayName } = this.props.currentUser.currentUser
        var allRequestsDocs = []
        firestore.collection("resolve").where("studentName", "==", displayName).get().then(Snapshot => {
            Snapshot.forEach(doc => {
                allRequestsDocs.push(doc.data())
                this.setState({ allRequests: allRequestsDocs })
            })
        })
    }
    render() {
        const accept = async (wantCourse, haveCourse, studentName, id) => {
            const { displayName, uid } = this.props.currentUser.currentUser
            this.setState({ loading: true })
            await firestore.collection("users").where("displayName", "==", studentName).get().then(Snapshot => {
                Snapshot.forEach(doc => {
                    this.setState({ studentNameID: doc.data().uid })
                })
            })
            await firestore.collection("courses").where("courseName", "==", haveCourse).get().then(Snapshot => {
                Snapshot.forEach(doc => {
                    this.setState({ haveCourseID: doc.data().courseCode })
                })
            })
            await firestore.collection("users").doc(`${uid}`).get().then(doc => {
                var hasWantCourse = doc.data().coursesWantList
                if (hasWantCourse.includes(this.state.haveCourseID)) {
                    this.setState({ isWantCourse: true })
                }
            })
            if (this.state.isWantCourse) {
                await firestore.collection("users").doc(`${uid}`).update({
                    coursesHaveList: firebase.firestore.FieldValue.arrayRemove(wantCourse),
                    coursesWantList: firebase.firestore.FieldValue.arrayRemove(this.state.haveCourseID)
                })
                await firestore.collection("courses").doc(this.state.haveCourseID).update({
                    seatsAvailable: firebase.firestore.FieldValue.increment(-1),
                    seatsInDemand: firebase.firestore.FieldValue.increment(-1),
                    studentsHaveList: firebase.firestore.FieldValue.arrayRemove(studentName),
                    studentsWantList: firebase.firestore.FieldValue.arrayRemove(displayName)
                })
                await firestore.collection("courses").doc(wantCourse).update({
                    seatsAvailable: firebase.firestore.FieldValue.increment(-1),
                    seatsInDemand: firebase.firestore.FieldValue.increment(-1),
                    studentsHaveList: firebase.firestore.FieldValue.arrayRemove(displayName),
                    studentsWantList: firebase.firestore.FieldValue.arrayRemove(studentName)
                })
                try {
                    await firestore.collection("users").doc(this.state.studentNameID).update({
                        coursesHaveList: firebase.firestore.FieldValue.arrayRemove(this.state.haveCourseID),
                        coursesWantList: firebase.firestore.FieldValue.arrayRemove(wantCourse)
                    })
                }
                catch (error) {
                    console.log(error.message);
                }
                await firestore.collection("resolve").doc(id).get().then(doc => {
                    doc.ref.delete()
                })
                this.setState({ isError: "The request has been accepted and the necessary changes has been done !!" })
            }
            else {
                this.setState({ isError: "You don't want the course which the user is offering !! Please add in your cart to accept this offer" })
            }

        }
        const decline = (want, have, studentName) => {
            firestore.collection("resolve").where("requestAdder", "==", studentName).get().then(Snapshot => {
                Snapshot.forEach(doc => {
                    if ((doc.data().courseHave === have) && (doc.data().courseWant === want)) {
                        doc.ref.delete()
                    }
                })
            })
            this.setState({ isError: "The request has been deleted !! Refresh to see changes" })
        }
        return (
            <div style={{ display: "flex", justifyContent: "center", flexDirection: "column" }}>
                <h3 style={{ color: "white", textAlign: "center" }}>MY REQUESTS!!</h3>
                <Table striped bordered style={{ width: "90%", margin: "auto", backgroundColor: "white", color: "black" }}>
                    <thead>
                        <tr>
                            <th>Course You Will Drop</th>
                            <th>Course You Will Add</th>
                            <th>Student Name</th>
                            <th>Accept</th>
                            <th>Decline</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.allRequests.map(eachReq => {
                            return (
                                <tr>
                                    <td>{eachReq.courseWant}</td>
                                    <td>{eachReq.courseHave}</td>
                                    <td>{eachReq.requestAdder}</td>
                                    <td>
                                        <Button disabled={this.state.loading} onClick={() => accept(eachReq.courseWant, eachReq.courseHave, eachReq.requestAdder, eachReq.id)} variant="success"> ACCEPT</Button>
                                    </td>
                                    <td>
                                        <Button onClick={() => decline(eachReq.courseWant, eachReq.courseHave, eachReq.requestAdder)} variant="danger"> DECLINE</Button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </Table>
                <div style={{ display: "flex", justifyContent: "center" }}>
                    {this.state.isError}
                </div>
            </div>
        )
    }
}

const mapStateToProps = state => ({
    currentUser: state.authUser
})

export default connect(mapStateToProps, null)(myRequests)