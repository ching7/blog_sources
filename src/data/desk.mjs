// 首页桌面上的四件物件。文案可以打磨，事实不能改（38 个收藏、笔记篇数、2020 年）。
// blurb 里的 {N} 由页面替换成笔记集合的实际篇数。
export const DESK = [
  {
    href: '/repos/', emoji: 'gift', title: '拆盲盒',
    blurb: '几个顺手造的小轮子。其中一个不知道为什么，被 38 个陌生人收藏了。',
    short: '几个顺手造的小轮子。其中一个不知道为什么，被 38 个陌生人收藏了。',
    sectionLabel: '仓库', colorName: '瑠璃', color: 'var(--c-repos)',
  },
  {
    href: '/aesthetics/', emoji: 'rainbow', title: '偷来的颜色',
    blurb: '从别人那儿顺来的颜色、画和字体。这张桌子也是用它们拼的。',
    short: '从别人那儿顺来的颜色、画和字体。',
    sectionLabel: '审美', colorName: '鴇', color: 'var(--c-aesthetics)',
  },
  {
    href: '/explore/', emoji: 'rocket', title: '可能会炸',
    blurb: '还没想清楚的实验和半成品。点进去之前，建议后退半步。',
    short: '还没想清楚的实验和半成品。',
    sectionLabel: '探索', colorName: '若竹', color: 'var(--c-explore)',
  },
  {
    href: '/notes/', emoji: 'sauropod', title: '考古现场',
    blurb: '挖出 {N} 篇 2020 年前后的 Java 笔记。那时候还在和 jstack 谈恋爱。',
    short: '{N} 篇 2020 年前后的 Java 笔记。那时候还在和 jstack 谈恋爱。',
    sectionLabel: '笔记', colorName: '白鼠', color: 'var(--c-notes)',
  },
];
