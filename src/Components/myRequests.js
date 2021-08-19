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
            isError: ""
        }
    }
    componentDidMount() {

        console.log(this.props.currentUser);
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
        const accept = (wantCourse, haveCourse, studentName) => {
            const { displayName, uid } = this.props.currentUser.currentUser
            var want = ""
            var have = ""
            firestore.collection("courses").where("courseName", "==", wantCourse).get().then(doc => {
                console.log(doc.data());
                want = doc.data().courseCode
            })
            firestore.collection("courses").where("courseName", "==", haveCourse).get().then(doc => {
                console.log(doc.data());
                have = doc.data().courseCode
            })
            firestore.collection("users").doc(`${uid}`).update({
                coursesHaveList: firebase.firestore.FieldValue.arrayRemove(want),
                coursesWantList: firebase.firestore.FieldValue.arrayRemove(have)
            })
            var studentID = ""
            firestore.collection("users").where("displayName", "==", studentName).get().then(doc => {
                studentID = doc.data().uid
            })
            firestore.collection("users").doc(studentID).update({
                coursesHaveList: firebase.firestore.FieldValue.arrayRemove(have),
                coursesWantList: firebase.firestore.FieldValue.arrayRemove(want)
            })
            firestore.collection("courses").doc(`${want}`).update({
                studentsWantList: firebase.firestore.FieldValue.arrayRemove(studentName),
                seatsInDemand: firebase.firestore.FieldValue.increment(-1)
            })
            firestore.collection("courses").doc(`${have}`).update({
                studentsHaveList: firebase.firestore.FieldValue.arrayRemove(displayName),
                seatsAvalaible: firebase.firestore.FieldValue.increment(-1)
            })
            this.setState({ isError: "The request has been accepted and resolved !! Refresh to see changes" })
        }
        const decline = (want, have, studentName) => {
            console.log(want, have, studentName);
            firestore.collection("resolve").where("requestAdder", "==", studentName).get().then(Snapshot => {
                Snapshot.forEach(doc => {
                    if ((doc.data().courseHave === have) && (doc.data().courseWant === want)) {
                        console.log(doc.data().courseHave, doc.data().courseWant);
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
                                        <Button onClick={() => accept(eachReq.courseWant, eachReq.courseHave, eachReq.requestAdder)} variant="success"> ACCEPT</Button>
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