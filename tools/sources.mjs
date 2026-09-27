// 素材源码：curriculum/sources.json 固定每个仓库的地址与提交号，工具只读那个提交里的文件，
// 与本地克隆的工作区状态无关。本地克隆的位置写在 tools/env.local.json 的 sources 里，
// 没写的仓库克隆到 .cache/sources/<名字>.git（不入库）
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {ENV, ROOT, readJson} from './common.mjs';

const CACHE = path.join(ROOT, '.cache/sources');
export const SOURCES = readJson(path.join(ROOT, 'curriculum/sources.json'));

export const source = (name) => {
  const s = SOURCES[name];
  if (!s) throw new Error(`curriculum/sources.json 里没有素材仓 ${name}`);
  return s;
};

const git = (repo, args, opts = {}) => execFileSync('git', ['-C', repo, ...args], opts);

// 找到一个含有固定提交的 git 仓库：先用本地克隆，没有就克隆到缓存目录
const repoWith = (name) => {
  const s = source(name);
  const local = ENV.sources[name] ? path.resolve(ROOT, ENV.sources[name]) : null;
  const repo = local ?? path.join(CACHE, `${name}.git`);
  if (!local && !fs.existsSync(repo)) {
    fs.mkdirSync(CACHE, {recursive: true});
    execFileSync('git', ['clone', '--bare', '--quiet', s.repo, repo], {stdio: 'inherit'});
  }
  try {
    git(repo, ['cat-file', '-e', `${s.commit}^{commit}`], {stdio: 'ignore'});
  } catch {
    git(repo, ['fetch', '--quiet', s.repo, s.commit], {stdio: 'inherit'});
  }
  return repo;
};

// 固定提交里某个文件的原始字节
export const readSourceFile = (name, file) => git(repoWith(name), ['show', `${source(name).commit}:${file}`], {maxBuffer: 64 << 20});

// 固定提交的完整快照目录，给 evidence/run.sh 这类需要整棵源码树的实验用
export const sourceSnapshot = (name) => {
  const s = source(name);
  const dir = path.join(CACHE, `${name}-${s.commit.slice(0, 12)}`);
  if (fs.existsSync(path.join(dir, '.complete'))) return dir;
  fs.rmSync(dir, {recursive: true, force: true});
  fs.mkdirSync(dir, {recursive: true});
  // 用临时索引把固定提交检出到快照目录，不碰源仓自己的索引与工作区；关掉换行转换，文件与提交里逐字节相同
  const gitDir = git(repoWith(name), ['rev-parse', '--absolute-git-dir']).toString().trim();
  const index = path.join(CACHE, `${name}.index`);
  const env = {...process.env, GIT_INDEX_FILE: index};
  const g = (args) => execFileSync('git', ['-c', 'core.autocrlf=false', '--git-dir', gitDir, '--work-tree', dir, ...args], {env});
  g(['read-tree', s.commit]);
  g(['checkout-index', '--all', '--force']);
  fs.rmSync(index, {force: true});
  fs.writeFileSync(path.join(dir, '.complete'), s.commit + '\n');
  return dir;
};
