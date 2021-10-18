export const highlight = (text: string) => {
  const lines = text.split("\n");

  const newLines = lines.map(
    (line: string) => line.replace(/(\(.+\)|[\S]+)/g, (match: string, token: string) => {
      if (token === "if") {
        return `<span class="code-if">${token}</span>`;
      } else if (token === "else") {
        return `<span class="code-else">${token}</span>`;
      } else if (token === "{" || token === "}") {
        return `<span class="code-block">${token}</span>`;
      } else if (token.startsWith("(")) {
        return `<span class="code-condition">${token}</span>`;
      } else {
        return match;
      }
    })
  ).join("\n");

  return newLines;
};
