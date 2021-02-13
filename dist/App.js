import React, {useState} from "../_snowpack/pkg/react.js";
import "./App.css.proxy.js";
import {ToastContainer} from "../_snowpack/pkg/react-toastify.js";
import "../_snowpack/pkg/react-toastify/dist/ReactToastify.css.proxy.js";
import {Devices} from "./Devices.js";
import {CodeInput} from "./CodeInput.js";
function App({}) {
  const [devices, setDevices] = useState([]);
  const run = (src) => {
    console.log("---> ", src);
  };
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", {
    className: "App"
  }, /* @__PURE__ */ React.createElement("header", null, /* @__PURE__ */ React.createElement(Devices, {
    value: devices,
    onChange: setDevices
  })), /* @__PURE__ */ React.createElement("main", null), /* @__PURE__ */ React.createElement("footer", null, /* @__PURE__ */ React.createElement(CodeInput, {
    onChange: run
  }))), /* @__PURE__ */ React.createElement(ToastContainer, {
    hideProgressBar: true
  }));
}
export default App;
