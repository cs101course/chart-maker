type tokenType = "keyword" | "text" | "grouping" | "start" | "end";
interface Token {
  type: tokenType;
  value: string;
  lineNum: number;
}

const isText = (character: string) => {
  return character.match(/[a-z]/i);
}

const tokeniser = (text: string) => {
  let token = "";
  let lineNum = 0;
  const brackets = ["(", ")", "{", "}"];
  const keywords = ["if", "else", "while"];
  const tokenList: Array<Token> = [];

  const addToken = (type: tokenType) => {
    const trimmedToken = token.trim();
    if (trimmedToken !== "") {
      tokenList.push({
        type,
        value: trimmedToken,
        lineNum
      });
      token = "";
    }
  }

  for (let charIndex = 0; charIndex < text.length; charIndex++) {
    let char = text.charAt(charIndex);

    if (char === '"') {
      throw new Error(`Illegal quote character: " on line ${lineNum}.`);
    } else if (!isText(char)) {
      // didn't get a text character
      if (keywords.includes(token.trim())) {
        // token is a keyword, add this token
        addToken("keyword");
      }
      
      if (brackets.includes(char)) {
        // character is a bracket, end token
        addToken("text");

        // also push the bracket as a token
        token = char;
        addToken("grouping")
      } else if (char === '\n') {
        addToken("text");
        lineNum++;
      } else {
        // treat everything else as text
        token += char;
      }
    } else {
      // char is text, continue building token
      token += char;
    }
  }

  // add any leftover tokens
  addToken("text");

  return tokenList;
}

interface Node {
  type: "statement" | "condition" | "loop";
  id?: string;
  loop?: Array<Node>;
  then?: Array<Node>;
  else?: Array<Node>;
  text?: string;
  isEnd?: boolean;
}

const preprocess = (inputTokens: Array<Token>) => {
  const startToken: Token = {type: "start", value: "Start", lineNum: 0};
  const tokens: Token[] = [startToken].concat(inputTokens);
  const endToken: Token = { type: "end", value: "End", lineNum: tokens[tokens.length-1].lineNum}
  tokens.push(endToken);

  let tokenIndex = 1;
  while (tokenIndex < tokens.length) {
    const token = tokens[tokenIndex];
    const prevToken = tokens[tokenIndex-1];

    if (token.type === "keyword" && token.value === "if" && prevToken.type === "keyword" && prevToken.value === "else") {
      // else if

      const openingToken = { type: "grouping" as tokenType, value: "{", lineNum: token.lineNum };
      tokens.splice(tokenIndex, 0, openingToken);

      let insertionFound = false;
      let hasOpened = false;
      let subScanIndex = tokenIndex + 1;
      let blockCount = 0;
      while (subScanIndex < tokens.length && !insertionFound) {
        const subToken = tokens[subScanIndex];
        const nextSubToken = tokens[subScanIndex + 1];

        if (subToken.type === "grouping" && subToken.value === "{") {
          blockCount++;
          hasOpened = true;
        } else if (subToken.type === "grouping" && subToken.value === "}") {
          blockCount--;
        }

        if (blockCount === 0 && hasOpened) {
          if (nextSubToken && nextSubToken.type === "keyword" && nextSubToken.value === "else") {
            // skip the else block
            hasOpened = false;
            subScanIndex++;
          } else {
            insertionFound = true;
          }
        } else {
          subScanIndex++;
        }
      }

      if (blockCount == 0) {
        const closingToken = { type: "grouping" as tokenType, value: "}", lineNum: tokens[subScanIndex-1].lineNum };
        tokens.splice(subScanIndex, 0, closingToken);
      } else if (blockCount < 0) {
        throw new Error(`Mismatched opening "{" on line ${token.lineNum}`);
      } else if (blockCount > 0) {
        throw new Error(`Mismatched closing "}" on line ${tokens[subScanIndex-1].lineNum}`);
      }
    }

    tokenIndex++;
  }

  return tokens;
}

const convertToTree = (text: string) => {
  const tree: Array<Node> = [];
  let statements: Array<Node> = tree;
  const parentStack: Array<Array<Node>> = [];

  let state: string = "root";
  let currId: number = 0;

  let expected: null | Array<string> = null;

  const tokens = preprocess(tokeniser(text));

  tokens.forEach((token, tokenIndex) => {
    let expectedType;
    if (token.type === "text" || token.type === "start" || token.type === "end") {
      expectedType = "statement";
    } else {
      expectedType = token.value;
    }

    if (expected !== null && !expected.includes(expectedType)) {
      throw new Error(`Unexpected ${token.type} "${token.value}" on line ${token.lineNum}. Expecting: ${expected.join(', ')}.`);
    }
    
    if (token.type === "keyword") {
      if (token.value === "if") {
        expected = ["("];
        state = "if";

        const newCondition: Node = {
          type: "condition"
        };
        statements.push(newCondition);
      } else if (token.value === "else") {
        expected = ["if", "{"]
        state = "else";

        const lastStatement = statements[statements.length - 1];
        if (lastStatement === undefined || lastStatement.type !== "condition") {
          throw new Error(`"else" without "if" on line ${token.lineNum}.`);
        }

        const nextToken = tokens[tokenIndex + 1];
        if (nextToken !== undefined && nextToken.type === "keyword" && nextToken.value === "if") {
          throw new Error(`"else if" not supported on line ${token.lineNum}.`);
        }
      } else if (token.value === "while") {
        expected = ["("];
        state = "while";

        const newCondition: Node = {
          type: "loop"
        };
        statements.push(newCondition);
      }
    } else if (token.type === "grouping") {
      if (token.value === '(') {
        expected = ["statement"];
      } else if (token.value === ')') {
        expected = ["{"];
      } else if (token.value === '{') {
        expected = ["statement", "if", "}", "while"];


        const lastStatement = statements[statements.length - 1];
        if (state === "if") {
          state = "then";

          lastStatement.then = [];
          parentStack.push(statements);
          statements = lastStatement.then;
        } else if (state === "else") {
          lastStatement.else = [];
          parentStack.push(statements);
          statements = lastStatement.else;
        } else if (state === "while") {
          state = "loop";

          lastStatement.loop = [];
          parentStack.push(statements);
          statements = lastStatement.loop;
        }
      } else if (token.value === "}") {
        expected = ["else", "statement", "}"];

        statements = parentStack.pop();
      }
    } else {
      if (state === "if" || state === "while") {
        expected = [")"];
      } else {
        expected = ["}", "statement", "if", "while"];
      }

      const id = `id${currId}`;

      if (state === "if" || state === "while") {
        const lastStatement = statements[statements.length - 1];
        lastStatement.id = id;
        lastStatement.text = token.value;
      } else {
        statements.push({
          type: "statement",
          id,
          text: token.value,
          isEnd: token.type === "end"
        });
      }
      
      currId++;
    }
  });

  return tree;
};

interface Link {
  statements: Array<Node>;
  index: number;
  parent: Link | null;
};

export const parse = (text:string) => {
  const output = ["flowchart TD"];
  const tree = convertToTree(text);
  const stack: Array<Link> = [];

  stack.push({
    statements: tree,
    index: 0,
    parent: null
  });

  while (stack.length !== 0) {
    const block = stack.pop();

    if (block.statements === undefined) {
      throw new Error("Error: no condition or statement.");
    }

    const statement = block.statements[block.index];

    let parent = block;
    let next = parent.statements[parent.index + 1];

    while (next === undefined && parent) {
      parent = parent.parent;

      if (parent) {
        const parentStatement = parent.statements[parent.index];
        if (parentStatement && parentStatement.type === "loop") {
          // loop back to parent statement
          next = parentStatement;
        } else {
          // move to statement after higher parent
          next = parent.statements[parent.index+1];
        }
      }
    }

    const sep = next && next.isEnd ? '--->' : '-->';

    if (block.index < block.statements.length - 1) {
      stack.push({
        statements: block.statements,
        index: block.index + 1,
        parent: block.parent
      });
    }

    if (statement === undefined) {
      // empty statement block
      if (next) {
        let nonEmptyParent = block.parent;

        while (nonEmptyParent && nonEmptyParent.statements === undefined) {
          nonEmptyParent = nonEmptyParent.parent;
        }

        if (nonEmptyParent) {
          const prev = nonEmptyParent.statements[nonEmptyParent.index];

          if (prev.type === "condition") {
            output.push(`${prev.id}-- Yes -->${next.id}`);
          } else if (prev.type === "loop") {
            throw new Error("Error: Empty loop.");
          }
        }
      }
    } else if (statement.type === "statement") {
      output.push(`${statement.id}["${statement.text}"]`);

      if (next) {
        output.push(`${statement.id}${sep}${next.id}`);
      }
    } else if (statement.type === "condition" || statement.type === "loop") {
      output.push(`${statement.id}{"${statement.text}"}`);

      if (statement.else && statement.else.length > 0) {
        // else block
        stack.push({
          statements: statement.else,
          index: 0,
          parent: block
        });
        output.push(`${statement.id}-- No -->${statement.else[0].id}`);
      } else if (next) {
        output.push(`${statement.id}-- No ${sep}${next.id}`);
      }

      const innerBlock = statement.type === "condition" ? statement.then : statement.loop;
      stack.push({
        statements: innerBlock,
        index: 0,
        parent: block
      });

      if (innerBlock && innerBlock[0]) {
        output.push(`${statement.id}-- Yes -->${innerBlock[0].id}`);
      }
    }
  }

  return output.join("\n") + "\n";
};
