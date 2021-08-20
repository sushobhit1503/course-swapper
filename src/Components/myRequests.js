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
        const accept = (wantCourse, haveCourse, studentName, id) => {
            const { displayName, uid } = this.props.currentUser.currentUser
            console.log(wantCourse, haveCourse, studentName);
            var haveCourseIDs = ""
            firestore.collection("courses").where("courseName", '==', haveCourse).get().then(Snapshot => {
                Snapshot.forEach(doc => {
                    console.log(doc.data().courseCode);
                    haveCourseIDs = doc.data().courseCode
                    this.setState({ haveCourseID: haveCourseIDs }, () => {
                        var hasWantCourse = []
                        var isWantCourse = false
                        firestore.collection("users").doc(`${uid}`).get().then(doc => {
                            hasWantCourse = doc.data().coursesWantList
                            console.log(hasWantCourse);
                            console.log(this.state.haveCourseID);
                            isWantCourse = hasWantCourse.includes(this.state.haveCourseID)
                            console.log(isWantCourse);
                            if (isWantCourse) {
                                var batch = firestore.batch()
                                var removeCourseReceiver = firestore.collection("users").doc(`${uid}`)
                                batch.update(removeCourseReceiver, {
                                    coursesHaveList: firebase.firestore.FieldValue.arrayRemove(wantCourse),
                                    coursesWantList: firebase.firestore.FieldValue.arrayRemove(this.state.haveCourseID)
                                })
                                var studentNameUID = ""
                                firestore.collection("users").where("displayName", "==", studentName).get().then(Snapshot => {
                                    Snapshot.forEach(doc => {
                                        studentNameUID = doc.data().uid
                                        firestore.collection("users").doc(studentNameUID).update({
                                            coursesHaveList: firebase.firestore.FieldValue.arrayRemove(this.state.haveCourseID),
                                            coursesWantList: firebase.firestore.FieldValue.arrayRemove(wantCourse)
                                        })
                                        firestore.collection("courses").doc(this.state.haveCourseID).update({
                                            seatsAvailable: firebase.firestore.FieldValue.increment(-1),
                                            seatsInDemand: firebase.firestore.FieldValue.increment(-1),
                                            studentsHaveList: firebase.firestore.FieldValue.arrayRemove(studentName),
                                            studentsWantList: firebase.firestore.FieldValue.arrayRemove(displayName)
                                        })
                                        firestore.collection("courses").doc(wantCourse).update({
                                            seatsAvailable: firebase.firestore.FieldValue.increment(-1),
                                            seatsInDemand: firebase.firestore.FieldValue.increment(-1),
                                            studentsHaveList: firebase.firestore.FieldValue.arrayRemove(displayName),
                                            studentsWantList: firebase.firestore.FieldValue.arrayRemove(studentName)
                                        })
                                        firestore.collection("resolve").doc(id).get().then(doc => {
                                            doc.ref.delete()
                                        })
                                    })
                                })
                            }
                            else {
                                this.setState({ isError: "You don't want the course which the user is offering !! Please add in your cart to accept this offer" })
                            }
                        })
                    })
                })
            })
            console.log(this.state.haveCourseID);
            // var hasWantCourse = []
            // var isWantCourse = false
            // firestore.collection("users").doc(`${uid}`).get().then(doc => {
            //     hasWantCourse = doc.data().coursesWantList
            //     console.log(hasWantCourse);
            //     console.log(this.state.haveCourseID);
            //     isWantCourse = hasWantCourse.includes(this.state.haveCourseID)
            //     console.log(isWantCourse);
            // })
            // if (isWantCourse) {
            //     var batch = firestore.batch()
            //     var removeCourseReceiver = firestore.collection("users").doc(`${uid}`)
            //     batch.update(removeCourseReceiver, {
            //         coursesHaveList: firebase.firestore.FieldValue.arrayRemove(wantCourse),
            //         coursesWantList: firebase.firestore.FieldValue.arrayRemove(this.state.haveCourseID)
            //     })
            //     var studentNameUID = ""
            //     firestore.collection("users").where("displayName", "==", studentName).get().then(doc => {
            //         studentNameUID = doc.data().uid
            //     })
            //     var removeCourseRequester = firestore.collection("users").doc(studentNameUID)
            //     batch.update(removeCourseRequester, {
            //         coursesHaveList: firebase.firestore.FieldValue.arrayRemove(this.state.haveCourseID),
            //         coursesWantList: firebase.firestore.FieldValue.arrayRemove(wantCourse)
            //     })
            //     var removeCourseHaveReq = firestore.collection("courses").doc(this.state.haveCourseID)
            //     batch.update(removeCourseHaveReq, {
            //         seatsAvailable: firebase.firestore.FieldValue.increment(-1),
            //         seatsInDemand: firebase.firestore.FieldValue.increment(-1),
            //         studentsHaveList: firebase.firestore.FieldValue.arrayRemove(studentName),
            //         studentsWantList: firebase.firestore.FieldValue.arrayRemove(displayName)
            //     })
            //     var removeCourseWantReq = firestore.collection("courses").doc(wantCourse)
            //     batch.update(removeCourseWantReq, {
            //         seatsAvailable: firebase.firestore.FieldValue.increment(-1),
            //         seatsInDemand: firebase.firestore.FieldValue.increment(-1),
            //         studentsHaveList: firebase.firestore.FieldValue.arrayRemove(displayName),
            //         studentsWantList: firebase.firestore.FieldValue.arrayRemove(studentName)
            //     })
            //     var removeResolveReq = firestore.collection("resolve").doc(id)
            //     batch.delete(removeResolveReq)
            //     batch.commit().then(() => {

            //         this.setState({ isError: "Request has been accepted and necessary changes has been made" })
            //     })
            // }
            // else {
            //     this.setState({ isError: "You don't want the course which the user is offering !! Please add in your cart to accept this offer" })
            // }
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
                                        <Button disabled onClick={() => accept(eachReq.courseWant, eachReq.courseHave, eachReq.requestAdder, eachReq.id)} variant="success"> ACCEPT</Button>
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