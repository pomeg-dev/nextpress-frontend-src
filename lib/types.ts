export interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

export type Post = {
  acf_data: any;
  breadcrumbs: string;
  content: string;
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
  card?: Cards;
  yoastHeadJSON?: any;
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
  innerContent: string[];
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
  include_content?: boolean;
  page?: number;
  post__in?: number[];
  post__not_in?: number[];
  post_type?: string | string[];
  post_type__not_in?: string | string[];
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
  category_name?: string | string[];
  tag_name?: string | string[];
  category__in?: number[];
  tag__in?: number[];
  [key: `filter_${string}`]: string | string[] | number | number[];
};

export type ImageProps = {
  src: string;
  alt: string;
  url?: string;
  name?: string;
  mime_type?: string;
  icon?: string;
  width?: number;
  height?: number;
  className?: string;
  blurImage?: string;
  blurDataURL?: string;
  loading?: "eager" | "lazy" | undefined;
  quality?: number;
  sizes?: any;
  description?: string;
  caption?: string;
  placeholder?: PlaceholderValue | undefined;
};

export type LinkItemProps = {
  url: string;
  title?: string;
  target?: string;
};

export type ButtonProps = {
  link: LinkItemProps;
  style?: string;
  size?: string;
  icon?: ImageProps;
};

export type MenuItemsProps = {
  ID?: number;
  title: string;
  url: string;
  target?: string;
  classes?: string[];
  children?: MenuItemsProps[];
  active?: boolean;
  gated?: boolean;
  acf_data?: any;
};

export type Cards = "PostCard";

export type BlockOptions = {
  theme_override?: string; 
  padding_top?: number | string; 
  padding_bottom?: number | string;
};

import { DefaultSession } from "next-auth";
import { PlaceholderValue } from "next/dist/shared/lib/get-img-props";

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
