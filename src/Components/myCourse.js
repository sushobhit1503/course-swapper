import React from "react"
import { Table, Modal, Form, Button } from "react-bootstrap"
import { firestore, removeCourse } from "../config"
import { connect } from "react-redux"
import { Link, withRouter } from "react-router-dom"


class myCourse extends React.Component {
    constructor() {
        super()
        this.state = {
            allCoursesHave: [],
            allCoursesWant: [],
            detailHave: [],
            detailWant: [],
            showModal: false,
            allStudentsHave: ["Select Course Name first"],
            wantCourseSelect: "",
            haveCourseSelect: "",
            studentName: "",
            isError: ""
        }
    }
    componentDidMount() {
        const { currentUser } = this.props.authUser
        console.log(currentUser);
        firestore.collection("users").doc(`${currentUser.uid}`).get().then(doc => {
            this.setState({ allCoursesHave: doc.data().coursesHaveList })
            this.setState({ allCoursesWant: doc.data().coursesWantList })
        })
        let havedetails = []
        currentUser.coursesHaveList.map(id => {
            return (
                firestore.collection("courses").doc(`${id}`).get().then(doc => {
                    havedetails.push(doc.data())
                    this.setState({ detailHave: havedetails })
                })
            )
        })
        let wantdetails = []
        currentUser.coursesWantList.map(id => {
            return (
                firestore.collection("courses").doc(`${id}`).get().then(doc => {
                    wantdetails.push(doc.data())
                    this.setState({ detailWant: wantdetails })
                })
            )
        })
    }
    render() {
        var resolveDisabled = true
        if (this.state.wantCourseSelect !== "" && this.state.studentName !== "") {
            resolveDisabled = false
        }
        const onChange = (event) => {
            const { name, value } = event.target
            this.setState({ [name]: value })
        }
        const onChangeStudents = event => {
            const { name, value } = event.target
            this.setState({ [name]: value },)
            const docID = this.state.wantCourseSelect
            console.log(this.state);
            console.log(docID);
            if (docID !== "") {
                firestore.collection("courses").doc(docID).get().then(doc => {
                    const studentID = doc.data().studentsHaveList
                    this.setState({ allStudentsHave: studentID, haveCourseSelect: doc.data().courseName })
                })
            }
        }
        const checkCourse = (code, type) => {
            this.setState({ showModal: true, haveCourseSelect: code })
            // if (type === "HAVE") {
            //     firestore.collection("courses").doc(`${code}`).get().then(doc => {
            //         const studentID = doc.data().studentsHaveList
            //         this.setState({ allStudentsHave: studentID, wantCourseSelect: doc.data().courseName })
            //     })
            // }
        }

        const resolveCheck = () => {
            const { currentUser } = this.props.authUser
            const { haveCourseSelect, wantCourseSelect, studentName } = this.state
            firestore.collection("resolve").doc().set({
                courseHave: haveCourseSelect,
                courseWant: wantCourseSelect,
                studentName: studentName,
                requestAdder: currentUser.displayName
            })
            this.setState({ showModal: false, isError: "Request has been added" })
        }

        const deleteCourse = (code, type) => {
            const { currentUser } = this.props.authUser
            removeCourse(code, currentUser, type)
            this.setState({ isError: "Delete Successfully!! Refresh to see the changes" })
        }
        return (
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <h3 style={{ color: "white", textAlign: "center" }}>MY COURSES !!</h3>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
                    <Link to="/add-requirement">
                        <Button variant="success" size="sm" style={{ margin: "auto", alignSelf: "center" }}>Add Requirement</Button>
                    </Link>
                </div>
                <Table striped bordered style={{ width: "80%", margin: "auto", backgroundColor: "white" }}>
                    <thead>
                        <tr>
                            <th>COURSE CODE</th>
                            <th>COURSE NAME</th>
                            <th>COURSE TIME</th>
                            <th>STATUS</th>
                            <th>RESOLVE</th>
                            <th>DELETE</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.detailHave.map(eachCourse => {
                            return (
                                <tr>
                                    <td>{eachCourse.courseCode}</td>
                                    <td>{eachCourse.courseName}</td>
                                    <td>{eachCourse.courseTimings}</td>
                                    <td>HAVE</td>
                                    <td><Button variant="success" onClick={() => checkCourse(eachCourse.courseCode, "HAVE")}>RESOLVE
                                        <i style={{ paddingLeft: "5px" }} className="fa fa-check"></i>
                                    </Button></td>
                                    <td><Button variant="danger" onClick={() => deleteCourse(eachCourse.courseCode, "HAVE")}>DELETE
                                        <i style={{ paddingLeft: "5px" }} className="fa fa-trash-o"></i></Button></td>
                                </tr>
                            )
                        })}
                        {this.state.detailWant.map(eachCourse => {
                            return (
                                <tr>
                                    <td>{eachCourse.courseCode}</td>
                                    <td>{eachCourse.courseName}</td>
                                    <td>{eachCourse.courseTimings}</td>
                                    <td> WANT</td>
                                    <td>
                                        <Button disabled variant="success" onClick={() => checkCourse(eachCourse.courseCode, "WANT")}>RESOLVE
                                            <i style={{ paddingLeft: "5px" }} className="fa fa-check"></i>
                                        </Button></td>
                                    <td><Button variant="danger" onClick={() => deleteCourse(eachCourse.courseCode, "WANT")}>DELETE
                                        <i style={{ paddingLeft: "5px" }} className="fa fa-trash-o"></i>
                                    </Button></td>
                                </tr>
                            )
                        })}
                    </tbody>
                </Table>
                <div style={{ display: "flex", justifyContent: "center" }}>
                    {this.state.isError}
                </div>
                <Modal show={this.state.showModal} onHide={() => { this.setState({ showModal: false }) }}>
                    <Modal.Header closeButton>
                        <Modal.Title style={{ color: "black" }}>Resolve Course</Modal.Title>
                    </Modal.Header>
                    <Modal.Body style={{ color: "black" }}>
                        <Form>
                            <Form.Group className="mb-3" controlId="formBasicCode">
                                <Form.Label>Select Course You want:</Form.Label>
                                <Form.Select onChange={onChangeStudents} value={this.state.wantCourseSelect} name="wantCourseSelect" aria-label="Default select example">
                                    <option>Select Course</option>
                                    {this.state.detailWant.map((singleCourse) => {
                                        return (
                                            <option value={singleCourse.courseCode}>{singleCourse.courseName}</option>
                                        )
                                    })}
                                </Form.Select>
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="formBasicCode">
                                <Form.Label>Select Student With Whom you want to swap:</Form.Label>
                                <Form.Select onChange={onChange} value={this.state.studentName} name="studentName" aria-label="Default select example">
                                    <option>Select Student</option>
                                    {this.state.allStudentsHave.map((singleCourse) => {
                                        return (
                                            <option value={singleCourse}>{singleCourse}</option>
                                        )
                                    })}
                                </Form.Select>
                            </Form.Group>
                            <div style={{ display: "flex", justifyContent: "center" }}>
                                <Button disabled={resolveDisabled} variant="primary" onClick={resolveCheck}>
                                    SEND REQUEST
                                </Button>
                            </div>
                        </Form>
                    </Modal.Body>
                </Modal>
            </div>
        )
    }
}

const mapStateToProps = state => ({
    authUser: state.authUser
})

export default connect(mapStateToProps, null)(withRouter(myCourse))