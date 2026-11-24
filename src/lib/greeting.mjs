/** 换一句：返回 [0, length) 内且不等于 current 的下标；只有一条时返回 0。 */
export function nextGreetingIndex(current, length, rand) {
  if (length <= 1) return 0;
  const step = 1 + Math.floor(rand() * (length - 1)); // 1..length-1
  return (current + Math.min(step, length - 1)) % length;
}

const PUNCT = /[。！？!?…，,、；;：:\s]/;

/** 拆成 [前半, 荧光笔部分, 句末标点]：荧光笔取句末标点前、遇到标点为止的最多 4 个字。 */
export function splitGreeting(text) {
  let end = text.length;
  while (end > 0 && PUNCT.test(text[end - 1])) end--;
  let start = end;
  while (start > 0 && end - start < 4 && !PUNCT.test(text[start - 1])) start--;
  return [text.slice(0, start), text.slice(start, end), text.slice(end)];
}
