import React from "../_snowpack/pkg/react.js";
import "./styles.css.proxy.js";
import {HashRouter, Route, Switch} from "../_snowpack/pkg/react-router-dom.js";
import {DeviceList} from "./DeviceList.js";
import {Device, DEVICE_ROUTE} from "./Device.js";
function App({}) {
  return /* @__PURE__ */ React.createElement(HashRouter, null, /* @__PURE__ */ React.createElement("div", {
    className: "h-full max-w-lg bg-gray-50 shadow-lg m-auto rounded-md overflow-auto"
  }, /* @__PURE__ */ React.createElement(Switch, null, /* @__PURE__ */ React.createElement(Route, {
    path: DEVICE_ROUTE
  }, /* @__PURE__ */ React.createElement(Device, null)), /* @__PURE__ */ React.createElement(Route, null, /* @__PURE__ */ React.createElement(DeviceList, null)))));
}
export default App;
