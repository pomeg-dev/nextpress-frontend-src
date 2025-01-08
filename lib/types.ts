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
