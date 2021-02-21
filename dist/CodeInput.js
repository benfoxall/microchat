import React from "../_snowpack/pkg/react.js";
export const CodeInput = ({onChange}) => {
  const submit = (event) => {
    event.preventDefault();
    const code = new FormData(event.currentTarget).get("code");
    if (typeof code === "string") {
      onChange(code);
    }
  };
  return /* @__PURE__ */ React.createElement("form", {
    className: "flex m-4 border-2 border-green-400",
    onSubmit: submit
  }, /* @__PURE__ */ React.createElement("input", {
    type: "text",
    name: "code",
    className: "flex-1 p-4 bg-gray-100 border-red-400"
  }), /* @__PURE__ */ React.createElement("input", {
    type: "submit",
    value: "send",
    className: "p-4 bg-green-400",
    spellCheck: false
  }));
};
