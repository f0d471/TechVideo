// 把 .agents/skills/ 下的每个 skill 以目录链接（Windows junction，不需要管理员权限）挂到 .claude/skills/，
// 让 Claude Code 自动发现；真实文件只有 .agents/skills/ 一份。用法：node tools/link_skills.mjs
import fs from 'node:fs';
import path from 'node:path';
import {ROOT} from './common.mjs';

const src = path.join(ROOT, '.agents/skills');
const dst = path.join(ROOT, '.claude/skills');
fs.mkdirSync(dst, {recursive: true});
let made = 0;
for (const name of fs.readdirSync(src)) {
  const link = path.join(dst, name);
  if (fs.existsSync(link)) continue;
  fs.symlinkSync(path.join(src, name), link, 'junction');
  made++;
}
console.log(`.claude/skills：新建 ${made} 个链接，共 ${fs.readdirSync(dst).length} 个`);
