
type TreeNode = {
  id: number;
  text: string;
  parent: TreeNode;
};

type Tree = Array<TreeNode>;

const INDENT_SIZE = 4;

export const parse = (text: string) => {
  const lines = text.split("\n");
  let mermaidOutput = ["graph TD"];

  const tree: Tree = [];
  const textLookup: { [key: string]: number } = {};

  let lastIndentationLevel = 0;
  let parent: TreeNode | undefined = undefined;

  lines.forEach((line: string, index: number) => {
    const indentationLevel = Math.floor(
      line.match(/^\s*/g)[0].length / INDENT_SIZE
    );
    const text = line.trim().replace(/[^a-zA-Z \-\(\)\d]/g, "");

    if (text !== "") {
      if (indentationLevel > lastIndentationLevel) {
        // parent is last added node
        parent = tree[tree.length - 1];
      } else if (indentationLevel < lastIndentationLevel) {
        let outdent = lastIndentationLevel - indentationLevel;

        while (outdent !== 0 && parent !== undefined) {
          parent = parent.parent;
          outdent--;
        }
      }

      const existingNodeId = textLookup[text];

      const node: TreeNode = {
        id: existingNodeId === undefined ? index : existingNodeId,
        text,
        parent,
      };

      textLookup[text] = node.id;

      tree.push(node);
      lastIndentationLevel = indentationLevel;
    }
  });

  tree.forEach((node) => {
    mermaidOutput.push(`${node.id}["${node.text}"]`);
    if (node.parent) {
      mermaidOutput.push(`${node.parent.id} --> ${node.id}`);
    }
  });

  return mermaidOutput.join("\n") + "\n";
};
