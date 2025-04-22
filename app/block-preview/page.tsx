import { BlockParser } from "@/ui/block-parser";
import { PreviewWrapper } from "./preview-wrapper";
import { decompressFromUrlSafeBase64 } from "@/utils/compression";

type NextProps = {
  params: Promise<{ slug: string[] }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
};

export default async function Post({ params, searchParams }: NextProps) {
  const resolvedSearchParams = await searchParams;

  let blocks = null;
  if (typeof resolvedSearchParams.content === 'string') {
    try {
      const decoded = decompressFromUrlSafeBase64(resolvedSearchParams.content);
      if (decoded) {
        blocks = JSON.parse(decoded);
      }
    } catch (error) {
      console.error('Error parsing block content:', error);
    }
  }

  return (
    <>
      <PreviewWrapper postId={resolvedSearchParams.post_id} iframeId={resolvedSearchParams.iframe_id}>
        {blocks && <BlockParser blocks={blocks} />}
      </PreviewWrapper>
    </>
  );
}