import React from "react"
import { Card } from 'antd';
import { Form, Button } from "react-bootstrap"
import { addRequirementTo, firestore } from "../config"
import { connect } from "react-redux"


class addRequirement extends React.Component {
    constructor() {
        super()
        this.state = {
            courseName: [],
            courseHave: "",
            courseWant: "",
            isError: ""
        }
    }

    async componentDidMount() {
        let rows = []
        const allCourses = await firestore.collection("courses").get()
        allCourses.forEach(doc => {
            rows.push(doc.data())
            this.setState({ courseName: rows })
        })
    }
    render() {
        var reqDisabled = true
        if (this.state.courseHave !== "" && this.state.courseWant !== "") {
            reqDisabled = false
        }
        const { currentUser } = this.props.authUser
        const onChange = event => {
            const { name, value } = event.target
            this.setState({ [name]: value })
        }

        const onSubmit = event => {
            event.preventDefault()
            addRequirementTo(this.state, currentUser)
            this.setState({ isError: "The course has been saved", courseHave: "", courseWant: "" })
        }
        return (
            <div style={{ display: "flex", justifyContent: "center", flexDirection: "column" }}>
                <Card style={{ width: "30%", display: "flex", justifyContent: "center", alignSelf: "center", margin: "auto" }}>

                    <h5 style={{ paddingBottom: "20px", width: "max-content", margin: "auto", color: "#303030" }}>ADD YOUR REQUIREMENTS !!</h5>
                    <Form onSubmit={onSubmit} style={{ backgroundColor: "transparent" }}>
                        <Form.Group className="mb-3" controlId="formBasicName">
                            <Form.Label>Course You Have</Form.Label>
                            <Form.Select name="courseHave" onChange={onChange} value={this.state.courseHave} aria-label="Default select example">
                                <option>Select your course</option>
                                {this.state.courseName.map((singleCourse) => {
                                    return (
                                        <option value={singleCourse.courseCode}>{singleCourse.courseName}</option>
                                    )
                                })}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formBasicCode">
                            <Form.Label>Course You Want</Form.Label>
                            <Form.Select name="courseWant" onChange={onChange} value={this.state.courseWant} aria-label="Default select example">
                                <option>Select your course</option>
                                {this.state.courseName.map((singleCourse) => {
                                    return (
                                        <option value={singleCourse.courseCode}>{singleCourse.courseName}</option>
                                    )
                                })}
                            </Form.Select>
                        </Form.Group>
                        <div style={{ display: "flex", justifyContent: "center", color: "#DB4437" }}>
                            {this.state.isError}
                        </div>
                        <div style={{ display: "flex", justifyContent: "center" }}>
                            <Button disabled={reqDisabled} style={{ margin: "auto", alignSelf: "center" }} variant="primary" type="submit">
                                Submit
                            </Button>
                        </div>
                    </Form>
                </Card>
            </div>
        )
    }
}

const mapStateToProps = state => ({
    authUser: state.authUser,
    courseList: state.courseReducer
})

export default connect(mapStateToProps, null)(addRequirement)