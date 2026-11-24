/**
 * 笔记条目 id（相对 src/content/notes，去掉 .md）→ Hugo 当年生成的 URL 路径段。
 * Hugo 会把路径全部小写；_index 是分类目录页。
 */
export function legacySlug(id) {
  return id.replace(/\/_index$/, '').toLowerCase();
}
