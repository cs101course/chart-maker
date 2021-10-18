import * as React from "react";
import * as ReactDOM from "react-dom";

import {
  initLrs,
  saveAttachments,
  retrieveActivityState,
  saveActivityState,
} from "@openlearning/xapi";

import { App } from "./App";

const lrsConfig = initLrs();

const asciiToB64Url = (ascii: string) => {
  return encodeURIComponent(window.btoa(ascii));
};

const b64UrlToAscii = (b64: string) => {
  return window.atob(decodeURIComponent(b64));
};

// the pathname determines the diagram mode.
// Upload this app to a folder of this name:
//   tree_diagram = Indent to make a hierarchy
//   flowchart = Pseudocode Flowchart Maker
const pathName = window.location.pathname.replace(/\/$/, "").replace(/^\//, "");

const urlParams = new URLSearchParams(window.location.search);

// query param ?diagram={b64 encoded json}
// to render a pre-made diagram, read-only
const diagramB64 = urlParams.get("diagram");

const diagramInUrl = diagramB64 ? b64UrlToAscii(diagramB64) : "";

const diagramAccessUrl = new URL(document.location.href);

const render = (
  onSave: (diagram: string) => Promise<void>,
  initialDiagram: string
) => {
  ReactDOM.render(
    <App onSave={onSave} initialDiagram={initialDiagram} chartType={pathName}/>,
    document.getElementById("root")
  );
};

const lrsSave = (diagram: string) => {
  diagramAccessUrl.search = `?diagram=${asciiToB64Url(diagram)}`;

  // Save and Share
  return Promise.all([
    saveActivityState(lrsConfig, "diagram", {
      text: diagram
    }),
    saveAttachments(lrsConfig, [
      {
        contentType: "text/html",
        fileUrl: diagramAccessUrl.toString(),
        description: "A chart created by the learner",
        display: "Chart",
      },
    ])
  ]).then(() => {});
};

const errorSave = (diagram: string) => {
  // If there's no LRS configured, just throw an error with the diagram URL
  diagramAccessUrl.search = `?diagram=${asciiToB64Url(diagram)}`;
  return Promise.reject({
    error: "No LRS Configured",
    diagramUrl: diagramAccessUrl.toString(),
  });
};

if (diagramInUrl) {
  // there's a diagram in the URL, render using this and no save
  render(null, diagramInUrl);
} else if (lrsConfig) {
  // try load
  retrieveActivityState(lrsConfig, "diagram", null).then((diagram) => {
    const stateObject: any = diagram;
    const stateText: string = stateObject?.text || "";

    render(lrsSave, stateText);
  });
} else {
  // testing purposes
  render(errorSave, "");
}
