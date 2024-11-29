export type Post = {
  acf_data: any;
  id: number;
  slug: Slug;
  type: PostType;
  status: string;
  date: Date;
  title: string;
  excerpt: string;
  image: PostImage;
  categories: PostCategory[];
  category_names: string[];
  template: Template;
  tags: PostTag[];
  related_posts: number[];
  password: string;
};

export type Slug = {
  slug: string;
  full_path: string;
};

export type Template = {
  beforeContent: Block[];
  afterContent: Block[];
  title: string;
  slug: string;
};

export type PostWithContent = Post & {
  content: Block[];
};

export type PostCategory = {
  id: number;
  name: string;
  slug: string;
};

export type PostTag = {
  id: number;
  name: string;
  slug: string;
};

export type PostImage = {
  full: string;
  thumbnail: string;
};

export type PostType = {
  id: number;
  name: string;
  slug: string;
};

export type Block = {
  id: number;
  blockName: string;
  slug: string;
  innerHTML: string;
  innerContent: string;
  type: BlockType;
  attrs?: Record<string, any>;
  innerBlocks: Block[];
  parent: number;
};

export type BlockType = {
  id: number;
  name: string;
  slug: string;
};

export type WPQuery = {
  page?: number;
  post__in?: number[];
  post__not_in?: number[];
  per_page?: number;
  search?: string;
  after?: string;
  author?: number[];
  author_exclude?: number[];
  before?: string;
  exclude?: number[];
  include?: number[];
  offset?: number;
  order?: "asc" | "desc";
  orderby?:
    | "author"
    | "date"
    | "id"
    | "include"
    | "modified"
    | "parent"
    | "relevance"
    | "slug"
    | "include_slugs"
    | "post__in"
    | "title";
  slug?: string[];
  status?: string[];
  tax_relation?: "AND" | "OR";
};
