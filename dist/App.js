import React, {useState} from "../_snowpack/pkg/react.js";
import "../_snowpack/pkg/react-toastify/dist/ReactToastify.css.proxy.js";
import {ToastContainer} from "../_snowpack/pkg/react-toastify.js";
import {HashRouter, Route, Switch} from "../_snowpack/pkg/react-router-dom.js";
import {DeviceList} from "./DeviceList.js";
import {Device, DEVICE_ROUTE} from "./Device.js";
function App({}) {
  const [devices, setDevices] = useState([]);
  return /* @__PURE__ */ React.createElement(HashRouter, null, /* @__PURE__ */ React.createElement("div", {
    className: "h-full"
  }, /* @__PURE__ */ React.createElement(Switch, null, /* @__PURE__ */ React.createElement(Route, {
    path: DEVICE_ROUTE
  }, /* @__PURE__ */ React.createElement(Device, {
    devices,
    setDevices
  })), /* @__PURE__ */ React.createElement(Route, null, /* @__PURE__ */ React.createElement("header", null, /* @__PURE__ */ React.createElement(DeviceList, {
    value: devices,
    onChange: setDevices
  }))))), /* @__PURE__ */ React.createElement(ToastContainer, {
    hideProgressBar: true
  }));
}
export default App;
