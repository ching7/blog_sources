import { legacySlug } from './legacy-slug.mjs';

// 旧站的 categories 字段在迁移时被写坏了（24 篇都是「前端」），分组按顶层目录走
export const SECTIONS = {
  '01.dev': '后端基础',
  '02.front': '前端',
  '03.framework': '框架',
  '04.javalibrary': 'Java 知识库',
  '05.openSource': '开源项目',
  '06.javainterview': '面试',
};

export const isIndex = (entry) => entry.id.endsWith('/_index');
export const sectionOf = (entry) => entry.id.split('/')[0];
export const noteUrl = (entry) => `/posts/${legacySlug(entry.id)}/`;

/** 按顶层目录分组的正文笔记（不含 _index、草稿），组内按日期升序 */
export function groupNotes(entries) {
  const groups = Object.keys(SECTIONS).map((key) => ({ key, name: SECTIONS[key], items: [] }));
  for (const e of entries) {
    if (isIndex(e) || e.data.draft) continue;
    groups.find((g) => g.key === sectionOf(e))?.items.push(e);
  }
  for (const g of groups) g.items.sort((a, b) => (a.data.date ?? 0) - (b.data.date ?? 0));
  return groups.filter((g) => g.items.length);
}
