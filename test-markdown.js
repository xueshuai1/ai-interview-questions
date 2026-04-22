// Test the tokenizer-based syntax highlighting

const PYTHON_KEYWORDS = new Set([
  "import","from","def","class","return","if","else","elif","for","while",
  "try","except","with","as","yield","lambda","pass","break","continue",
  "raise","in","not","and","or","is","True","False","None","self","super",
  "global","nonlocal","assert","del","finally","async","await","print",
]);

const PYTHON_TYPES = new Set([
  "int","str","float","bool","list","dict","tuple","set","bytes","object",
  "type","Optional","Any","Union","List","Dict",
]);

const PYTHON_BUILTINS = new Set([
  "torch","nn","math","os","sys","json","re","typing","collections",
]);

function escapeHtml(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function tokenizePython(code) {
  const tokens = [];
  let i = 0;

  while (i < code.length) {
    if (code[i] === "#") {
      let end = code.indexOf("\n", i);
      if (end === -1) end = code.length;
      tokens.push({ type: "comment", text: code.slice(i, end) });
      i = end;
      continue;
    }

    if ((code.slice(i, i + 3) === '"""' || code.slice(i, i + 3) === "'''")) {
      const q = code.slice(i, i + 3);
      let end = code.indexOf(q, i + 3);
      if (end === -1) end = code.length;
      else end += 3;
      tokens.push({ type: "string", text: code.slice(i, end) });
      i = end;
      continue;
    }

    if (code[i] === '"' || (code[i] === "f" && code[i + 1] === '"')) {
      const qi = code[i] === "f" ? i + 1 : i;
      let j = qi + 1;
      while (j < code.length && code[j] !== '"') { if (code[j] === "\\") j++; j++; }
      tokens.push({ type: "string", text: code.slice(code[i] === "f" ? i : i, j + 1) });
      i = j + 1;
      continue;
    }

    if (code[i] === "'" || (code[i] === "f" && code[i + 1] === "'")) {
      const qi = code[i] === "f" ? i + 1 : i;
      let j = qi + 1;
      while (j < code.length && code[j] !== "'") { if (code[j] === "\\") j++; j++; }
      tokens.push({ type: "string", text: code.slice(code[i] === "f" ? i : i, j + 1) });
      i = j + 1;
      continue;
    }

    if (code[i] === "@") {
      let j = i + 1;
      while (j < code.length && /\w/.test(code[j])) j++;
      tokens.push({ type: "decorator", text: code.slice(i, j) });
      i = j;
      continue;
    }

    if (/\d/.test(code[i])) {
      let j = i;
      while (j < code.length && /[\d.]/.test(code[j])) j++;
      tokens.push({ type: "number", text: code.slice(i, j) });
      i = j;
      continue;
    }

    if (/[a-zA-Z_]/.test(code[i])) {
      let j = i;
      while (j < code.length && /\w/.test(code[j])) j++;
      const word = code.slice(i, j);

      let k = j;
      while (k < code.length && code[k] === " ") k++;
      if (code[k] === "(") {
        tokens.push({ type: "function", text: word });
        i = j;
        continue;
      }

      if (PYTHON_KEYWORDS.has(word)) tokens.push({ type: "keyword", text: word });
      else if (PYTHON_TYPES.has(word)) tokens.push({ type: "type", text: word });
      else if (PYTHON_BUILTINS.has(word)) tokens.push({ type: "builtin", text: word });
      else tokens.push({ type: "plain", text: word });
      i = j;
      continue;
    }

    tokens.push({ type: "plain", text: code[i] });
    i++;
  }

  return tokens;
}

function renderTokens(tokens) {
  const cls = { comment: "token-comment", string: "token-string", keyword: "token-keyword",
    number: "token-number", decorator: "token-decorator", builtin: "token-builtin",
    type: "token-type", function: "token-function", plain: "" };
  return tokens.map(t => {
    const e = escapeHtml(t.text);
    const c = cls[t.type];
    return c ? `<span class="${c}">${e}</span>` : e;
  }).join("");
}

// Test with the actual problematic code from voice-004
const testCode = `# 初始化 VoiceBox
voicebox = VoiceBox(model="voicebox-base-v2")

# 语音克隆：3 秒参考音频
cloner = VoiceCloner(voicebox)

# 加载参考音频
reference_audio = cloner.load_audio("reference.wav")

# 提取说话人嵌入
speaker_embedding = cloner.extract_speaker(reference_audio)
print(f"说话人嵌入维度: {speaker_embedding.shape}")  # (256,)`;

console.log("=== Input code ===");
console.log(testCode);
console.log("\n=== Highlighted output ===");
const highlighted = renderTokens(tokenizePython(testCode));
console.log(highlighted);

console.log("\n=== Checks ===");
console.log("Has token-comment:", highlighted.includes("token-comment"));
console.log("Has token-keyword:", highlighted.includes("token-keyword"));
console.log("Has token-string:", highlighted.includes("token-string"));
console.log("Has token-function:", highlighted.includes("token-function"));
console.log("Has &lt;span (escaped HTML):", highlighted.includes("&lt;span"));
console.log("Has class= inside span tag:", highlighted.includes('<span class="token-comment">'));

// Also check the full parseMarkdown flow
const { marked } = require('marked');
marked.setOptions({ breaks: true, gfm: true });

const CODE_PLACEHOLDER = "\x00CODEBLOCK\x00";

function highlightCode(code, lang) {
  if (lang === "python") return renderTokens(tokenizePython(code));
  return escapeHtml(code);
}

function parseMarkdown(text) {
  const codeBlocks = [];
  const processed = text.replace(/```(\w*)\n?([\s\S]*?)```/g, (_match, lang, code) => {
    codeBlocks.push({ lang: lang.trim(), code: code.replace(/\n$/, "") });
    return "\n" + CODE_PLACEHOLDER + "\n";
  });

  const html = marked.parse(processed);

  let result = html;
  let index = 0;
  const re = new RegExp("<p>\\s*" + CODE_PLACEHOLDER.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\s*<\\/p>", "g");
  result = result.replace(re, () => {
    const { lang, code } = codeBlocks[index++];
    const hl = highlightCode(code, lang);
    const label = lang ? lang[0].toUpperCase() + lang.slice(1) : "Code";
    return `<pre class="code-block"><div class="code-header"><span>${label}</span></div><code>${hl}</code></pre>`;
  });

  return result;
}

const fullTest = `### 4.3 Python 实战：语音克隆

Some intro text.

\`\`\`python
# 初始化 VoiceBox
voicebox = VoiceBox(model="voicebox-base-v2")

# 语音克隆：3 秒参考音频
cloner = VoiceCloner(voicebox)

# 加载参考音频
reference_audio = cloner.load_audio("reference.wav")

# 提取说话人嵌入
speaker_embedding = cloner.extract_speaker(reference_audio)
print(f"说话人嵌入维度: {speaker_embedding.shape}")
\`\`\`

Some closing text.`;

console.log("\n=== Full parseMarkdown result ===");
const fullResult = parseMarkdown(fullTest);
console.log(fullResult);

console.log("\n=== Final checks ===");
console.log("No escaped span tags:", !fullResult.includes("&lt;span"));
console.log("Has proper span tags:", fullResult.includes('<span class="token-comment">'));
console.log("Code not in <p> tags:", !fullResult.includes("<p><pre"));
