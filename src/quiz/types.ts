import type { MuseumItem } from '../types';

export type { MuseumItem };

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];     // exactly 4
  correctIndex: number;  // 0..3
  itemSlug?: string;     // the item this question is "about", for the review-screen link
}
