import { getCollection } from 'astro:content';
import { isIndex } from './notes.mjs';

export async function noteCount(): Promise<number> {
  return (await getCollection('notes', (e) => !isIndex(e) && !e.data.draft)).length;
}
