export interface Bookmark {
  id: string;
  url: string;
  title: string;
  description: string;
  favicon: string;
  collectionId: string | null;
  tags: string[];
  createdAt: number;
}

export interface Collection {
  id: string;
  name: string;
  icon: string;
  color: string;
  order: number;
}
