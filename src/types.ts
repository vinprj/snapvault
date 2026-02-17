export interface Bookmark {
  id: string;
  url: string;
  title: string;
  description: string;
  favicon: string;
  collectionId: string | null;
  tags: string[];
  visitCount: number;
  lastVisited: number | null;
  createdAt: number;
}

export interface Collection {
  id: string;
  name: string;
  icon: string;
  color: string;
  order: number;
  isPasswordProtected: boolean;
  password?: string;
}

export interface ExportData {
  bookmarks: Bookmark[];
  collections: Collection[];
  exportedAt: number;
  version: string;
}
