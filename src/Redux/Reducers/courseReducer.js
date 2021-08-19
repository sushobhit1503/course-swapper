const INITIAL_STATE = {
    allCourseName: []
}

export const courseReducer = (state = INITIAL_STATE, action) => {
    const { type, payload } = action
    switch (type) {
        case "SET_COURSE_LIST":
            return {
                ...state,
                allCourseName: payload
            }
        default:
            return state
    }
}