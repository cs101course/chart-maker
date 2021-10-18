
import * as React from "react";

import CodeInput from "react-simple-code-editor";

interface EditorProps {
  highlight?: (text: string) => string;
  text: string;
  onChange?: (text: string) => void;
}

const defaultHighlight = (text: string) => text;

export const Editor: React.FC<EditorProps> = ({ highlight, text, onChange }) => {

  return <div className="codeContainer">
    <CodeInput
      placeholder="Write here to build your diagram..."
      className="code"
      value={text}
      onValueChange={onChange}
      highlight={highlight || defaultHighlight}
      padding={10}
      tabSize={4}
      style={{
        fontFamily: '"Fira code", "Fira Mono", monospace',
        fontSize: 16,
        border: "1px solid #444"
      }}
      readOnly={!onChange}
    />
  </div>
};
