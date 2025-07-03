import React from "react";
import Image from "next/image";
import { Block } from "@/lib/types";
import Parser, { domToReact, HTMLReactParserOptions, Element } from "html-react-parser";

type ImageProps = Block & {
  innerBlocks?: React.ReactNode;
};

const ImageComponent: React.FC<ImageProps> = ({ ...block }: Block) => {
  // Extract dimensions from block data or style
  const getImageDimensions = (styleString?: string) => {
    let width = 0;
    let height = 0;
    
    // Try to get dimensions from block data first
    if (block.data?.width && block.data?.height) {
      width = parseInt(block.data.width.replace('px', ''));
      height = block.data.height === 'auto' ? 0 : parseInt(block.data.height.replace('px', ''));
    }
    
    // If not available, try to parse from style attribute
    if (!width && styleString) {
      const widthMatch = styleString.match(/width:\s*(\d+)px/);
      const heightMatch = styleString.match(/height:\s*(\d+)px/);
      
      if (widthMatch) width = parseInt(widthMatch[1]);
      if (heightMatch) height = parseInt(heightMatch[1]);
    }
    
    // Default fallback dimensions
    if (!width) width = 800;
    if (!height) height = 600;
    
    return { width, height };
  };

  const options: HTMLReactParserOptions = {
    replace: (domNode) => {
      // Check if it's an element node with the correct structure
      if (domNode.type === 'tag' && (domNode as any).name === 'figure') {
        const figureNode = domNode as any;
        
        // Find the img element within the figure
        const imgElement = figureNode.children?.find(
          (child: any) => child.type === 'tag' && child.name === 'img'
        );
        
        // Find the figcaption element within the figure
        const figcaptionElement = figureNode.children?.find(
          (child: any) => child.type === 'tag' && child.name === 'figcaption'
        );
        
        if (imgElement) {
          const src = imgElement.attribs?.src || '';
          const alt = imgElement.attribs?.alt || '';
          const imgClassName = imgElement.attribs?.class || '';
          const style = imgElement.attribs?.style || '';
          
          const { width, height } = getImageDimensions(style);
          
          return (
            <figure 
              className={figureNode.attribs?.class || ''}
              id={figureNode.attribs?.id || ''}
            >
              <Image
                src={src}
                alt={alt}
                width={width}
                height={height}
                className={imgClassName}
                style={{
                  width: block.data?.width || 'auto',
                  height: block.data?.height || 'auto',
                }}
                priority={false}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              {figcaptionElement && (
                <figcaption className={figcaptionElement.attribs?.class || ''}>
                  {domToReact(figcaptionElement.children || [])}
                </figcaption>
              )}
            </figure>
          );
        }
      }
      
      // Also handle standalone img tags (not wrapped in figure)
      if (domNode.type === 'tag' && (domNode as any).name === 'img') {
        const imgNode = domNode as any;
        const src = imgNode.attribs?.src || '';
        const alt = imgNode.attribs?.alt || '';
        const className = imgNode.attribs?.class || '';
        const style = imgNode.attribs?.style || '';
        
        const { width, height } = getImageDimensions(style);
        
        return (
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            className={className}
            style={{
              width: block.data?.width || 'auto',
              height: block.data?.height || 'auto',
            }}
            priority={false}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        );
      }
    }
  };

  return <>{Parser(block.innerHTML, options)}</>;
}
export default ImageComponent;