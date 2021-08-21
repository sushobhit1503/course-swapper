import { Table, Button, Modal } from "react-bootstrap"
import React from "react"
import { firestore } from "../config"
class Dashboard extends React.Component {
    constructor() {
        super()
        this.state = {
            allCourseName: [],
            showModal: false,
            filterValue: "",
            specificStudents: []
        }
    }
    componentDidMount() {
        let row1 = []
        firestore.collection("courses").where("seatsAvailable", ">=", 0).orderBy("seatsAvailable", "desc").get().then(allDocs => {
            allDocs.forEach(course => {
                row1.push(course.data())
            })
            this.setState({ allCourseName: row1 })
        })

    }
    render() {
        const checkStudents = (code, type) => {
            this.setState({ showModal: true })
            if (type === "HAVE") {
                firestore.collection("courses").doc(`${code}`).get().then(doc => {
                    const studentName = doc.data().studentsHaveList
                    var studentObject = []
                    studentName.map(eachStudent => {
                        return (
                            firestore.collection("users").where("displayName", "==", eachStudent).get().then(Snapshot => {
                                Snapshot.forEach(doc => {
                                    studentObject.push(doc.data())
                                    console.log(doc.data());
                                    this.setState({ specificStudents: studentObject })
                                })
                            })
                        )
                    })
                })
            }
            if (type === "WANT") {
                firestore.collection("courses").doc(`${code}`).get().then(doc => {
                    const studentName = doc.data().studentsWantList
                    var studentObject = []
                    studentName.map(eachStudent => {
                        return (
                            firestore.collection("users").where("displayName", "==", eachStudent).get().then(Snapshot => {
                                Snapshot.forEach(doc => {
                                    studentObject.push(doc.data())
                                    console.log(doc.data());
                                    this.setState({ specificStudents: studentObject })
                                })
                            })
                        )
                    })
                })
            }
        }
        const onChange = event => {
            const { name, value } = event.target
            this.setState({ [name]: value })
        }
        const filteredArray = this.state.allCourseName.filter(course => course.courseName.toLowerCase().includes(this.state.filterValue.toLowerCase()))
        return (
            <div style={{ color: "white", display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", justifyContent: "space-around" }}>
                    <div style={{ textAlign: "center", display: "none" }} >All Courses</div>
                </div>
                <input className="filter" style={{ width: "200px", margin: "auto", color: "black" }} placeholder="Search Course ...." name="filterValue" onChange={onChange} value={this.state.filterValue} type="search" />
                <div style={{ width: "none", marginBottom: "20px" }}>

                </div>
                <Table striped bordered style={{ width: "90%", margin: "auto", backgroundColor: "white", color: "black" }}>
                    <thead>
                        <tr>
                            <th>Course Code</th>
                            <th>Course Name</th>
                            <th>Course Time</th>
                            <th>Availability</th>
                            <th>Demand</th>
                            <th>Students (Have)</th>
                            <th>Students (Want)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredArray.map((EachCourse) => (
                            <tr>
                                <td>{EachCourse.courseCode}</td>
                                <td>{EachCourse.courseName}</td>
                                <td>{EachCourse.courseTimings}</td>
                                <td>{EachCourse.seatsAvailable}</td>
                                <td>{EachCourse.seatsInDemand}</td>
                                <td><Button onClick={() => checkStudents(EachCourse.courseCode, "HAVE")}>View Students</Button></td>
                                <td><Button onClick={() => checkStudents(EachCourse.courseCode, "WANT")}>View Students</Button></td>
                            </tr>
                        )
                        )}
                    </tbody>
                    <Modal show={this.state.showModal} onHide={() => { this.setState({ showModal: false, specificStudents: [] }) }}>
                        <Modal.Header closeButton>
                            <Modal.Title style={{ color: "black" }}>Student Name</Modal.Title>
                        </Modal.Header>
                        <Modal.Body style={{ color: "black" }}>
                            {this.state.specificStudents !== 0 ?
                                <div>
                                    {this.state.specificStudents.map(eachStudent => {
                                        return (
                                            <li>{eachStudent.displayName} <br />
                                                {eachStudent.email}
                                            </li>
                                        )
                                    })}
                                </div> :
                                <div>
                                    No students have this course
                                </div>}
                        </Modal.Body>
                    </Modal>
                </Table>
            </div >
        )
    }
}

export default Dashboard