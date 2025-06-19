import { PayloadAction } from "@reduxjs/toolkit";
import { ACTIONS } from "../../constants/constants";

// interface AlertState {
//   isVisible?: boolean;
//   title: string;
//   message: string;
//   button?: string;
//   onPress?: () => void;
// }

interface DeviceInfoState {
  id: string;
  name: string;
  type: string;
  token: string;
  isEmulator: boolean;
  manufacturer: string;
  appVersion: string;
  brand?: string;
}

interface ErrorState {
  message: string;
  code: string;
  timestamp: string;
}

interface HandlerState {
  // alert: AlertState;
  devicesInfo: DeviceInfoState;
  error?: ErrorState | null;
}

export const initialState: HandlerState = {
  // alert: {
  //   isVisible: false,
  //   title: "",
  //   message: "",
  //   button: "Ok",
  //   onPress: () => {},
  // },
  devicesInfo: {
    id: "",
    name: "",
    type: "",
    token: "",
    isEmulator: false,
    manufacturer: "",
    appVersion: "",
    brand: "",
  },
  error: null,
};

const handlerReducer = (state = initialState, action: PayloadAction<any>) => {
  switch (action.type) {
    // case ACTIONS.HANDLER.SHOW_ALERT:
    //   return {
    //     ...state,
    //     alert: {
    //       isVisible: true,
    //       title: action.payload.title,
    //       message: action.payload.message,
    //       button: action.payload.button,
    //       onPress: action.payload.onPress,
    //     },
    //   };

    // case ACTIONS.HANDLER.HIDE_ALERT:
    //   return {
    //     ...state,
    //     alert: initialState.alert,
    //   };

    case ACTIONS.HANDLER.GET_DEVICES_INFO:
      return {
        ...state,
        devicesInfo: action.payload,
        error: null,
      };

    case ACTIONS.HANDLER.DEVICE_INFO_ERROR:
      return {
        ...state,
        error: action.payload,
      };

    default:
      return state;
  }
};

export default handlerReducer;
