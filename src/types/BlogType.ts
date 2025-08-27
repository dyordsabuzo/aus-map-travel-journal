export type BlogMeta = {
  slug: string;
  title: string;
  date?: string;
  filePath: string;
};

export type BlogPost = BlogMeta & {
  content: string;
};
