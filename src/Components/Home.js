import React from "react"
import HomePic from "../Assets/home_gif.gif"

class Home extends React.Component {

    render() {
        return (
            <div style={{ display: "flex", justifyContent: "center", flexDirection: "column" }}>
                <img src={HomePic} alt="course_swapper" style={{ width: "50%", alignSelf: "center" }} />
            </div>
        )
    }
}

export default Home