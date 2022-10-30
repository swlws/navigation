import fse from "fs-extra";
import path from "path";
import mdToHtml from "./create/index.mjs";

const CWD = process.cwd();
const CURRENT_PATH = path.resolve(CWD, "script");
const MD_DIR = path.resolve(CWD, "md");
const DIST = path.resolve(CWD, "docs");
const DIST_PAGES = path.resolve(CWD, "docs/pages");

fse.ensureDirSync(DIST);
fse.ensureDirSync(DIST_PAGES);

function copyStatic(src, dist) {
  const dirs = fse.readdirSync(src);
  for (let dir of dirs) {
    const s = path.resolve(src, dir);
    const d = path.resolve(dist, dir);
    const stat = fse.statSync(s);
    if (stat.isDirectory()) {
      fse.ensureDirSync(d);

      copyStatic(s, d);
    } else {
      const rs = fse.createReadStream(s);
      const ws = fse.createWriteStream(d);

      rs.pipe(ws);
    }
  }
}

function buildOneMd(fileName) {
  const filePath = path.resolve(MD_DIR, fileName + ".md");
  const data = fse.readFileSync(filePath, "utf8");
  const res = mdToHtml(data, {
    stylesheet: ["../css/github-style.css", "../css/style.css"],
  });

  fse.writeFileSync(path.resolve(DIST_PAGES, fileName + ".html"), res);
}

function build() {
  copyStatic(path.resolve(CURRENT_PATH, "static"), DIST);

  const dirs = fse.readdirSync(MD_DIR);
  for (let dir of dirs) {
    if (!dir.endsWith(".md")) continue;

    const fileName = dir.substring(0, dir.lastIndexOf("."));

    buildOneMd(fileName);
  }
}
build();
