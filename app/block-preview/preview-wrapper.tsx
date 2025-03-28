"use client";

import { useEffect, useRef } from "react";

export function PreviewWrapper({ children, postId }: { children: React.ReactNode, postId?: string | string[] }) {
  const mainRef = useRef<HTMLElement>(null);
  
  useEffect(() => {
    const calculateHeight = () => {
      if (mainRef.current) {
        const height = mainRef.current.offsetHeight + 40;
        mainRef.current.setAttribute('data-height', `${height}`);

        if (window.parent && window.parent !== window) {
          window.parent.postMessage({
            type: 'blockPreviewHeight',
            height: height,
            postId: postId
          }, '*');
        }
      }
    };

    const hideOtherElements = () => {
      if (mainRef.current) {
        const bodyChildren = document.body.children;
        for (let i = 0; i < bodyChildren.length; i++) {
          const element = bodyChildren[i];
          if (element !== mainRef.current && element.tagName.toLowerCase() !== 'script') {
            (element as HTMLElement).style.display = 'none';
          }
        }
        const loader = mainRef.current.querySelector('.loader');
        if (loader) {
          (loader as HTMLElement).style.display = "none";
        }
      }
    };

    calculateHeight();
    hideOtherElements();
    window.addEventListener('resize', calculateHeight);
    return () => {
      window.removeEventListener('resize', calculateHeight);
    };
  }, [postId]);

  return (
    <main 
      ref={mainRef} 
      data-pageurl="block-preview" 
      data-postid={postId}
    >
      <div className="loader fixed left-0 top-0 z-[9999] flex h-full w-full items-center justify-center bg-white text-primary">Loading...</div>
      {children}
    </main>
  );
}