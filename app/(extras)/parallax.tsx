"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import simpleParallax from "simple-parallax-js";

export default function Parallax({ settings }: { settings: any }) {
  const pathname = usePathname();
  const parallaxElementsRef: any = useRef([]);
  const offsetsRef = useRef([]);

  //general parallax effect
  useEffect(() => {
    const parallaxElements = document.querySelectorAll("[class*='parallax-']");
    parallaxElements.forEach(
      (element) => {
        const scale = parseFloat(
          element.className.split("parallax-")[1].split(" ")[0]
        );

        if (scale === 0) {
          const image = element.querySelector("img");
          if (image) {
            image.style.transform = "translateY(0)";
          }
        } else {
          const image = element.querySelector("img");
          //if also has class parallax-overflow, set overflow to true in simleParallax
          const overflow = element.className.includes("parallax-overflow")
            ? true
            : false;

          if (image) {
            new simpleParallax(image, {
              scale: scale,
              overflow: overflow,
            });
          }
        }
      },
      [pathname]
    );
  });

  // //speed 0 parallax effect
  // useLayoutEffect(() => {
  //   const parallaxElements = document.querySelectorAll("[class*='parallax-0']");
  //   const offsets: any = [];

  //   parallaxElements.forEach((element) => {
  //     const offset = element.getBoundingClientRect().top + window.scrollY;
  //     offsets.push(offset);
  //   });

  //   parallaxElementsRef.current = parallaxElements;
  //   offsetsRef.current = offsets;

  //   const damping = 1;

  //   const handleScroll = () => {
  //     const scrollTop = window.scrollY;

  //     parallaxElementsRef.current.forEach(
  //       (element: HTMLElement, index: number) => {
  //         const fixedOffset = offsetsRef.current[index];
  //         const image = element.querySelector("img");
  //         const delta = scrollTop - fixedOffset;
  //         const translateY = delta * damping;
  //         if (image) {
  //           image.style.transform = `translateY(${translateY}px)`;
  //         }
  //       }
  //     );

  //     requestAnimationFrame(handleScroll);
  //   };

  //   handleScroll();

  //   return () => {
  //     window.removeEventListener("scroll", handleScroll);
  //   };
  // }, [pathname]);

  return <></>;
}
