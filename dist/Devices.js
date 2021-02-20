import React from "../_snowpack/pkg/react.js";
import {requestDevice} from "./puck-stuff.js";
import {toast} from "../_snowpack/pkg/react-toastify.js";
import {generatePath, NavLink} from "../_snowpack/pkg/react-router-dom.js";
import {DEVICE_ROUTE} from "./Device.js";
export const Devices = ({
  value,
  onChange
}) => {
  const addDevice = async () => {
    try {
      const device = await requestDevice();
      if (value.includes(device)) {
        toast.warn("already added");
      } else {
        onChange((prev) => prev.concat(device));
      }
    } catch (e) {
      console.warn(e);
      toast.warn("Not added");
    }
  };
  const remove = (device) => () => onChange((devices) => devices.filter((target) => device !== target));
  return /* @__PURE__ */ React.createElement("section", {
    className: "DeviceList"
  }, /* @__PURE__ */ React.createElement("ul", null, value.map((device) => /* @__PURE__ */ React.createElement(NavLink, {
    to: generatePath(DEVICE_ROUTE, {deviceId: btoa(device.id)}),
    key: device.id
  }, /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("h2", null, device.name, /* @__PURE__ */ React.createElement("button", {
    onClick: remove(device)
  }, "\xD7")))))), /* @__PURE__ */ React.createElement("button", {
    onClick: addDevice
  }, "Add"));
};
