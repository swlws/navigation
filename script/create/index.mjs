import { marked } from "marked";
import fse from "fs-extra";
import path from "path";

const CURRENT_PATH = path.join(process.cwd(), "script", "create");

const PLACEHOLDER = {
  TITLE: "title",
  MEAT: "meta",
  LINK: "link",
  STYLESHEET: "stylesheet",
  CONTENT: "content",
};

function mergeOptions(options = {}) {
  const template = fse.readFileSync(
    path.resolve(CURRENT_PATH, "template.html"),
    {
      encoding: "utf8",
    }
  );

  return {
    template,
    meta: [],
    link: [],
    ...options,
  };
}

function createMetaEls(meta = {}) {
  return Object.keys(meta)
    .map((key) => `<meta name="${key}" content="${meta[key]}" />`)
    .join("\n\t");
}

function createStylesheetEls(stylesheet = []) {
  return stylesheet
    .map((v) => `<link rel="stylesheet" type="text/css" href="${v}" />`)
    .join("\n\t");
}

function createBodyEls(str = "") {
  return marked.parse(str);
}

/**
 * 讲一个MD文档转化为HTML文档
 *
 * @param {*} str MD文档内容
 * @param {*} options 参数
 */
export default function mdToHtml(str, options = {}) {
  const { template, meta, stylesheet } = mergeOptions(options);

  if (!template) return createBodyEls(str);

  return template.replace(/\{{([\w_]+)\}}/g, (sub, $0) => {
    let doc = "";
    switch ($0) {
      case PLACEHOLDER.MEAT:
        doc = createMetaEls(meta);
        break;
      case PLACEHOLDER.STYLESHEET:
        doc = createStylesheetEls(stylesheet);
        break;
      case PLACEHOLDER.CONTENT:
        doc = createBodyEls(str);
        break;
      default:
        break;
    }

    return doc || "";
  });
}
