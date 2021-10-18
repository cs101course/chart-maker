import * as React from "react";
import { Editor } from "./Editor";
import Mermaid from "mermaid";

import { parse as treeParser } from "./treeParser";
import { parse as flowchartParser } from "./flowchartParser";

import { highlight as flowchartHighlighter } from "./flowchartHighlighter";

import "./App.css";

const parsers = {
  "tree_diagram": treeParser,
  "flowchart": flowchartParser
};

const highlighters = {
  "tree_diagram": (text: string) => text,
  "flowchart": flowchartHighlighter
};

const showEditor = {
  "tree_diagram": false,
  "flowchart": true
};

const MermaidAPI = Mermaid.mermaidAPI;

const DEFAULT_CONFIG = {
  startOnLoad: false,
  securityLevel: "strict",
};

MermaidAPI.initialize(DEFAULT_CONFIG);
interface AppProps {
  onSave: (diagram: string) => Promise<void>;
  initialDiagram: string;
  chartType?: string;
}

export const App = ({ onSave, initialDiagram, chartType }: AppProps) => {
  const containerRef = React.useRef<HTMLDivElement>();
  const [text, setText] = React.useState(initialDiagram);
  const [diagram, setDiagram] = React.useState("");
  const [error, setError] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);

  const parse = (chartType !== "flowchart" && chartType !== "tree_diagram") ? parsers["tree_diagram"] : parsers[chartType];
  const highlight = (chartType !== "flowchart" && chartType !== "tree_diagram") ? highlighters["tree_diagram"] : highlighters[chartType];

  const handleSaveClick = () => {
    if (onSave) {
      setIsSaving(true);

      onSave(text).then(() => {
        setIsSaving(false);
      }).catch((error) => {
        console.log(error);
      });
    }
  };

  React.useEffect(() => {
    if (containerRef?.current === undefined) return;

    try {
      MermaidAPI.render(
        "mermaid-render",
        parse(text),
        (sc) => {
          setDiagram(sc);
          setError("");
        },
        containerRef.current
      );
    } catch (err) {
      setError(err.message);

      /*if (err.message.startsWith("Cannot")) {
        throw err;
      }*/
    }
  }, [text, containerRef.current]);

  return (
    <div className="app">
      {onSave ? (
        <>
          <div className="editor">
            <Editor text={text} onChange={setText} highlight={highlight}/>
          </div>
          <div className="toolbar">
            <button className="button" type="button" onClick={handleSaveClick} disabled={isSaving || !!error}>
              Save
            </button>
          </div>
        </>
      ) : (
        showEditor && (
          <div className="editor">
            <Editor text={text} highlight={highlight}/>
          </div>
        )
      )}
      <div
        ref={containerRef}
        className="diagram"
        dangerouslySetInnerHTML={{ __html: diagram }}
      ></div>
      <div className="diagramError">
        <pre>{error}</pre>
      </div>
    </div>
  );
};
