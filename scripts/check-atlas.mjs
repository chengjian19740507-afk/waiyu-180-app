#!/usr/bin/env node
// 校验 13 语种句数 / 类别对齐 / 字段完整性 / 媒体文件存在
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const LANGS = ['en','es','fr','ar','ru','de','hi','pt','ja','ko','vi','it','th'];
const VOCAB_LANGS = ['en','es','fr','ru','ja','ko','ar'];
const EXPECT_SENTENCES = 180;
const EXPECT_VOCAB = 1000;
const REQUIRED = ['id','category','category_zh','text','romanization','translation'];

let errors = 0;
const variance = [];
const warn = (m) => { console.error('  ✗ ' + m); errors++; };

// 基准类别集合（取第一个语种）
const base = new Set(JSON.parse(readFileSync(join(ROOT,'sentences-en.json'),'utf8')).map(x => x.category));

console.log('▶ 句库校验');
for (const l of LANGS) {
  const f = join(ROOT, `sentences-${l}.json`);
  if (!existsSync(f)) { warn(`sentences-${l}.json 缺失`); continue; }
  const d = JSON.parse(readFileSync(f,'utf8'));
  const problems = [];
  if (d.length !== EXPECT_SENTENCES) problems.push(`句数 ${d.length} ≠ ${EXPECT_SENTENCES}`);
  for (const x of d) {
    for (const k of REQUIRED) if (!(k in x) || x[k] === '' || x[k] == null) { problems.push(`id=${x.id} 缺字段 ${k}`); break; }
  }
  const ids = d.map(x => x.id);
  if (new Set(ids).size !== ids.length) problems.push('id 重复');
  const cats = new Set(d.map(x => x.category));
  if (problems.length) warn(`${l}: ${problems.slice(0,5).join('; ')}`);
  else console.log(`  ✓ ${l}  ${d.length} 句 / ${cats.size} 类`);
  // 各语种场景组合存在差异（部分语种含 visa 而无 social），属内容差异，仅提示
  const missing = [...base].filter(c => !cats.has(c));
  const extra = [...cats].filter(c => !base.has(c));
  if (missing.length || extra.length) {
    variance.push(`${l}: ${missing.length?'少 '+missing.join(','):''}${missing.length&&extra.length?' / ':''}${extra.length?'多 '+extra.join(','):''}`);
  }
}

console.log('▶ 词表校验');
for (const l of VOCAB_LANGS) {
  const f = join(ROOT, `vocabulary-${l}.json`);
  if (!existsSync(f)) { warn(`vocabulary-${l}.json 缺失`); continue; }
  const d = JSON.parse(readFileSync(f,'utf8'));
  if (d.length !== EXPECT_VOCAB) warn(`${l}: 词数 ${d.length} ≠ ${EXPECT_VOCAB}`);
  else console.log(`  ✓ ${l}  ${d.length} 词`);
}

// 关键资源存在性
console.log('▶ 资源校验');
for (const f of ['index.html','style.css','waiyu-180-final.js','manifest.json','privacy.html','terms.html','LICENSE','LICENSE-DATA','icon-192.png','icon-512.png']) {
  if (!existsSync(join(ROOT,f))) warn(`缺文件 ${f}`);
}
if (variance.length) {
  console.log('\n▶ 场景组合差异（各语种内容不完全一致，界面按语种动态渲染，不影响使用）');
  for (const v of variance) console.log('  · ' + v);
}
console.log(errors ? `\n✗ 校验未通过：${errors} 处问题` : '\n✓ 全部通过');
process.exit(errors ? 1 : 0);
