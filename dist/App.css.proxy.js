// [snowpack] add styles to the page (skip if no document exists)
if (typeof document !== 'undefined') {
  const code = ".App {\n  height: 100vh;\n  display: flex;\n  flex-direction: column;\n}\n\nheader {\n  background: #0003;\n  padding: 0.5rem;\n}\n\nmain {\n  flex: 1;\n}\n\nfooter {\n  background: #0003;\n  height: 1rem;\n  padding: 0.5rem;\n}\n";

  const styleEl = document.createElement("style");
  const codeEl = document.createTextNode(code);
  styleEl.type = 'text/css';
  styleEl.appendChild(codeEl);
  document.head.appendChild(styleEl);
}