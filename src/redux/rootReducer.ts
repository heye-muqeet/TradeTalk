import { combineReducers } from "redux";
// import userReducer from "./user/userReducer";
import appReducer from "./app/appReducer";
import handlerReducer from "./handler/handlerReducer";

const rootReducer: any = combineReducers({
    // Add your reducers here
    appState: appReducer,
    handlerState: handlerReducer
});

export default rootReducer;

