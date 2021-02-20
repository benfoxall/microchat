import React from "../_snowpack/pkg/react.js";
import {requestDevice} from "./puck-stuff.js";
import {toast} from "../_snowpack/pkg/react-toastify.js";
import {generatePath, NavLink} from "../_snowpack/pkg/react-router-dom.js";
import {DEVICE_ROUTE} from "./Device.js";
export const DeviceList = ({
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
    }
  };
  const remove = (device) => (e) => {
    e.preventDefault();
    onChange((devices) => devices.filter((target) => device !== target));
  };
  return /* @__PURE__ */ React.createElement("section", null, /* @__PURE__ */ React.createElement("ul", null, value.map((device) => /* @__PURE__ */ React.createElement(NavLink, {
    to: generatePath(DEVICE_ROUTE, {
      id: device.id,
      name: device.name || "?"
    }),
    key: device.id
  }, /* @__PURE__ */ React.createElement("li", {
    className: "flex items-center justify-between text-green-200"
  }, /* @__PURE__ */ React.createElement("div", {
    className: "rounded-full bg-gray-800 w-12 h-12 hover:bg-gray-700 transition shadow-md m-5"
  }), /* @__PURE__ */ React.createElement("h2", {
    className: " flex-1"
  }, device.name), /* @__PURE__ */ React.createElement("button", {
    className: "m-4 bg-red-400 hover:bg-red-700 p-2 rounded-lg",
    onClick: remove(device)
  }, "\xD7"))))), /* @__PURE__ */ React.createElement("button", {
    className: "rounded-full bg-purple-800 w-12 h-12 hover:bg-purple-700 transition shadow-lg fixed bottom-4 right-4 text-white",
    onClick: addDevice
  }, "+"));
};
