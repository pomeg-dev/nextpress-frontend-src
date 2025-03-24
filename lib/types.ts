export type Post = {
  acf_data: any;
  breadcrumbs: string;
  id: number;
  slug: Slug;
  type: PostType;
  path: string;
  status: string;
  date: Date;
  title: string;
  excerpt: string;
  featured_image: FeaturedImage;
  image: PostImage;
  categories: PostCategory[];
  category_names: string[];
  terms: {[key: string]: string[]};
  template: Template;
  tags: PostTag[];
  related_posts: number[];
  password: string;
  card?: Cards
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

export type FeaturedImage = {
  sizes: {
    full: string;
    large: string;
    medium: string;
    thumbnail: string;
  };
  url: string;
};

export type PostType = {
  id: string | number;
  name: string;
  slug: string;
};

export type Block = {
  id: number;
  blockName: string;
  className?: string;
  slug: string;
  innerHTML: string;
  innerContent: string;
  type: BlockType;
  attrs?: Record<string, any>;
  innerBlocks: Block[];
  parent: number;
  data: any;
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

export type ImageProps = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  blurImage?: string;
};

export type LinkItemProps = {
  url?: string;
  target?: string;
  title?: string;
};

export type ButtonProps = {
  link: LinkItemProps;
};

export type MenuItemsProps = {
  title: string;
  url: string;
  target?: string;
  classes?: string[];
  children?: MenuItemsProps[];
  active?: boolean;
  gated?: boolean;
};

export type Cards = "PostCard" | "ProductCard" | "CourseCard";

export type ProductProps = {
  title: string;
  slug?: string;
  id?: number;
  url?: string;
  description?: string;
  image?: ImageProps;
  product_type?: string[];
  price: number;
  sku?: string;
  currency?: string;
  qty?: number;
  attributes?: {
    [key: string]: string | undefined;
  },
  options?: {
    name: string;
    label: string;
    info_label?: string;
    info_content?: string;
    choices: { label: string; value: string; }[];
  }[];
  purchase_options?: {
    name: string;
    label: string;
    description?: string;
    discount_percent?: number;
    choices?: { label: string; value: string; }[];
  }[];
};

import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user?: {
      accessToken?: string;
      refreshToken?: string;
      instanceUrl?: string;
    } & DefaultSession["user"];
  }
}

// app/api/auth/callback/salesforce/route.ts
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");

  if (!code) {
    return new Response("No code provided", { status: 400 });
  }

  // Redirect to the NextAuth callback endpoint
  return redirect(`/api/auth/callback/salesforce?code=${code}`);
}
