import React from "react";
import { Block } from "@/lib/types";
import { BlockParser } from "../../block-parser";
import classNames from "classnames";

type ColumnsProps = Block & {
  innerBlocks?: React.ReactNode;
};

const Columns: React.FC<ColumnsProps> = ({ ...block }: Block) => {
  const { innerBlocks, innerContent, data } = block;
  const backgroundColor = data?.style?.color?.background || data?.backgroundColor;
  const textColor = data?.style?.color?.text || data?.textColor || "primary";
  
  let id: string | undefined = undefined;
  if (innerContent?.[0]) {
    const regex = /id=["']([^"']*)["']/;
    const match = regex.exec(innerContent?.[0]);
    id = match ? match[1] : undefined;
  }

  const columnsCount = data?.columns || (Array.isArray(innerBlocks) ? innerBlocks.length : 2);
  const isStackedOnMobile = data?.isStackedOnMobile !== false;
  const verticalAlignment = data?.verticalAlignment;
  const columnGap = data?.style?.spacing?.blockGap || data?.columnGap || '2rem';

  const getColumnClasses = () => {
    const baseClasses = isStackedOnMobile ? 'flex flex-col' : 'flex flex-col sm:flex-row';
    
    const responsiveClasses = isStackedOnMobile ? {
      'md:grid md:grid-cols-1': columnsCount === 1,
      'md:grid md:grid-cols-2': columnsCount === 2,
      'md:grid md:grid-cols-3': columnsCount === 3,
      'md:grid md:grid-cols-4': columnsCount === 4,
      'md:grid md:grid-cols-5': columnsCount === 5,
      'md:grid md:grid-cols-6': columnsCount === 6,
    } : {
      'sm:grid sm:grid-cols-1': columnsCount === 1,
      'sm:grid sm:grid-cols-2': columnsCount === 2,
      'sm:grid sm:grid-cols-3': columnsCount === 3,
      'sm:grid sm:grid-cols-4': columnsCount === 4,
      'sm:grid sm:grid-cols-5': columnsCount === 5,
      'sm:grid sm:grid-cols-6': columnsCount === 6,
    };

    return classNames(baseClasses, responsiveClasses);
  };

  const layoutClasses = classNames(
    getColumnClasses(),
    {
      'items-center': verticalAlignment === 'center',
      'items-start': verticalAlignment === 'top',
      'items-end': verticalAlignment === 'bottom',
      'items-stretch': verticalAlignment === 'stretch' || !verticalAlignment,
    }
  );

  const getGapStyle = () => {
    if (block?.className?.includes('gap-0') || data?.className?.includes('gap-0')) {
      return { gap: '0' };
    }
    
    if (typeof columnGap === 'string') {
      if (columnGap.includes('rem') || columnGap.includes('px') || columnGap.includes('em')) {
        return { gap: columnGap };
      }
      const gapMap: Record<string, string> = {
        'small': '1rem',
        'medium': '2rem',
        'large': '3rem',
        'xl': '4rem',
      };
      return { gap: gapMap[columnGap] || columnGap };
    }
    return { gap: '2rem' };
  };

  return (
    <div
      id={id}
      className={classNames(
        "core-block columns-block wp-block-columns relative",
        data?.style?.color?.text && "has-text-color",
        block?.className
      )}
      style={{
        ...(textColor && {
          color: textColor.includes('#') ? textColor : `var(--color-${textColor})`
        }),
      }}
    >
      {innerBlocks && backgroundColor ? (
        <div
          className="has-background break-out"
          style={{
            backgroundColor: 
              backgroundColor.includes('#') ? backgroundColor : `var(--color-${backgroundColor})`,
          }}
        >
          <div className="container py-8">
            <div 
              className={layoutClasses}
              style={getGapStyle()}
            >
              <BlockParser blocks={innerBlocks} />
            </div>
          </div>
        </div>
      ) : (
        <div 
          className={layoutClasses}
          style={getGapStyle()}
        >
          <BlockParser blocks={innerBlocks} />
        </div>
      )}
    </div>
  );
};

export default Columns;