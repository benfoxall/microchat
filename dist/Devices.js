import React from "../_snowpack/pkg/react.js";
import {requestDevice} from "./puck-stuff.js";
import {toast} from "../_snowpack/pkg/react-toastify.js";
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
  }, /* @__PURE__ */ React.createElement("ul", null, value.map((device) => /* @__PURE__ */ React.createElement("li", {
    key: device.id
  }, /* @__PURE__ */ React.createElement("h2", null, device.name), /* @__PURE__ */ React.createElement("h3", null, device.id), /* @__PURE__ */ React.createElement("button", {
    onClick: remove(device)
  }, "remove")))), /* @__PURE__ */ React.createElement("button", {
    onClick: addDevice
  }, "Add"));
};
