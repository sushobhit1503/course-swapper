import { createStore, applyMiddleware, combineReducers } from "redux"
import logger from "redux-logger"
import { authReducer } from "./Reducers/authUser"
import { courseReducer } from "./Reducers/courseReducer"


const middleware = [logger]

const rootReducer = combineReducers({
    authUser: authReducer,
    courseReducer: courseReducer
})

export const store = createStore(rootReducer, applyMiddleware(...middleware))