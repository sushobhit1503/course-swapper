import { Card } from 'antd';
import { Form, Button } from "react-bootstrap"
import { addCourseTo, firestore } from "../config"
import React from "react"
import { withRouter } from 'react-router-dom';

class addCourse extends React.Component {
    constructor() {
        super()
        this.state = {
            courseName: "",
            code: "",
            time: ""
        }
    }
    render() {
        const onChange = event => {
            const { name, value } = event.target
            this.setState({ [name]: value })
        }
        const onSubmit = event => {
            event.preventDefault()
            addCourseTo(this.state)
        }
        return (
            <Card style={{ width: "35%", display: "flex", justifyContent: "center", alignSelf: "center", margin: "auto" }}>
                <Form onSubmit={onSubmit} style={{ backgroundColor: "transparent" }}>
                    <Form.Group className="mb-3" controlId="formBasicName">
                        <Form.Label>Course Name</Form.Label>
                        <Form.Control name="name" type="text" onChange={onChange} value={this.state.name} />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formBasicCode">
                        <Form.Label>Course Code</Form.Label>
                        <Form.Control name="code" type="text" onChange={onChange} value={this.state.code} />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formBasicTiming">
                        <Form.Label>Timings</Form.Label>
                        <Form.Control name="time" type="text" onChange={onChange} value={this.state.time} />
                    </Form.Group>
                    <Button variant="primary" type="submit">
                        Submit
                    </Button>
                </Form>
            </Card>
        );
    }
};

export default withRouter(addCourse)