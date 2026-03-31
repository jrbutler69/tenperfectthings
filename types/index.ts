export const CLOTHING_CATEGORIES = [
  { key: 'button_down', label: 'The Perfect Button-Down' },
  { key: 'polo', label: 'The Perfect Polo' },
  { key: 'tee', label: 'The Perfect Tee' },
  { key: 'khaki', label: 'The Perfect Khaki-Style Pants' },
  { key: 'jeans', label: 'The Perfect Jeans' },
  { key: 'shorts', label: 'The Perfect Short' },
  { key: 'suit', label: 'The Perfect Suit' },
  { key: 'blazer', label: 'The Perfect Blazer' },
  { key: 'dress_shoe', label: 'The Perfect Dress Shoe' },
  { key: 'sneaker', label: 'The Perfect Sneaker' },
] as const;

export type CategoryKey = typeof CLOTHING_CATEGORIES[number]['key'];

export const TEN_QUESTIONS = [
  "What's been your favorite decade so far?",
  "Karate or Karaoke?",
  "What are you sneaky-good at?",
  "What's your biggest pet peeve?",
  "Where do you like to unwind?",
  "Who's your style icon?",
  "What are you currently reading?",
  "What are you always listening to?",
  "If money were no object, what would you treat yourself to?",
  "What do you wish you'd known when you were twenty?",
] as const;

export interface ClothingItem {
  product_url: string;
  product_name: string;
  brand_name: string;
  image_url: string;
  quote: string;
}

export interface Profile {
  id: string;
  created_at: string;
  status: 'pending' | 'published' | 'rejected';
  slug: string;
  name: string;
  photo_url: string;
  bio: string;
  location: string;
  occupation: string;
  website?: string;
  question_answers: string[];
  clothing_picks: Record<CategoryKey, ClothingItem>;
}