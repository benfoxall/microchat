import React, {useState} from "../_snowpack/pkg/react.js";
import "./App.css.proxy.js";
import {ToastContainer} from "../_snowpack/pkg/react-toastify.js";
import {HashRouter, Route, Switch} from "../_snowpack/pkg/react-router-dom.js";
import "../_snowpack/pkg/react-toastify/dist/ReactToastify.css.proxy.js";
import {Devices} from "./Devices.js";
import {Device} from "./Device.js";
function App({}) {
  const [devices, setDevices] = useState([]);
  const run = (src) => {
  };
  return /* @__PURE__ */ React.createElement(HashRouter, null, /* @__PURE__ */ React.createElement("div", {
    className: "App"
  }, /* @__PURE__ */ React.createElement("header", null, /* @__PURE__ */ React.createElement(Devices, {
    value: devices,
    onChange: setDevices
  })), /* @__PURE__ */ React.createElement(Switch, null, /* @__PURE__ */ React.createElement(Route, {
    path: "/\u2192/:deviceId+"
  }, /* @__PURE__ */ React.createElement(Device, {
    devices,
    setDevices
  })))), /* @__PURE__ */ React.createElement(ToastContainer, {
    hideProgressBar: true
  }));
}
export default App;
