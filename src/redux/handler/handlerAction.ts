import { ACTIONS } from "../../constants/constants";

interface AlertState {
  title: string;
  message: string;
  button?: string;
  onPress?: () => void;
}

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

// export const showAlert = (data: AlertState) => ({
//   type: ACTIONS.HANDLER.SHOW_ALERT,
//   payload: data,
// });

// export const hideAlert = () => ({
//   type: ACTIONS.HANDLER.HIDE_ALERT,
// });

export const getDevicesInfo = (data: DeviceInfoState) => ({
  type: ACTIONS.HANDLER.GET_DEVICES_INFO,
  payload: data,
});

export const deviceInfoError = (error: ErrorState) => ({
  type: ACTIONS.HANDLER.DEVICE_INFO_ERROR,
  payload: error,
});
