"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { animate, inView, scroll } from "framer-motion";

export default function Animations() {
  const [hydrated, setHydrated] = useState(false);
  const animatedElements = useRef(new Set());
  const pathname = usePathname();
  const router = useRouter();
  console.log("aniamtion run... pathname:", pathname);

  //remove no-transition class after hydration, prevents all css animations from running on page load
  useEffect(() => {
    setHydrated(true);
    console.log("hydrated");
    document.body.classList.remove("no-transition");
  }, []);

  type animation = {
    [key: string]: any;
  };
  const animations: animation = {
    fade: { opacity: [0, 1], visibility: "visible" },
    "fade-up": { opacity: [0, 1], y: [100, 0], visibility: "visible" },
    "fade-down": { opacity: [0, 1], y: [-100, 0], visibility: "visible" },
    "fade-left": { opacity: [0, 1], x: [-100, 0], visibility: "visible" },
    "fade-right": { opacity: [0, 1], x: [100, 0], visibility: "visible" },
    "fade-up-right": {
      opacity: [0, 1],
      x: [100, 0],
      y: [100, 0],
      visibility: "visible",
    },
    "fade-up-left": {
      opacity: [0, 1],
      x: [-100, 0],
      y: [100, 0],
      visibility: "visible",
    },
    "fade-down-right": {
      opacity: [0, 1],
      x: [100, 0],
      y: [-100, 0],
      visibility: "visible",
    },
    "fade-down-left": {
      opacity: [0, 1],
      x: [-100, 0],
      y: [-100, 0],
      visibility: "visible",
    },
    "fade-in": { opacity: [0, 1], visibility: "visible" },
    "zoom-in": { scale: [0, 1], visibility: "visible" },
    "zoom-in-up": {
      scale: [0, 1],
      visibility: "visible",
    },
    "zoom-in-down": { scale: [0, 1], y: [-100, 0], visibility: "visible" },
    "zoom-in-left": { scale: [0, 1], x: [-100, 0], visibility: "visible" },
    "zoom-in-right": { scale: [0, 1], x: [100, 0], visibility: "visible" },
    "zoom-out": { scale: [2, 1], visibility: "visible" },
    "zoom-out-up": { scale: [2, 1], y: [100, 0], visibility: "visible" },
    "zoom-out-down": { scale: [2, 1], y: [-100, 0], visibility: "visible" },
    "zoom-out-left": { scale: [2, 1], x: [-100, 0], visibility: "visible" },
    "zoom-out-right": { scale: [2, 1], x: [100, 0], visibility: "visible" },
    "zoom-in-rotate-clockwise": {
      scale: [0, 1],
      rotate: [90, 0],
      visibility: "visible",
    },
    "zoom-in-rotate-anticlockwise": {
      scale: [0, 1],
      rotate: [-90, 0],
      visibility: "visible",
    },
    "flip-left": { rotateY: [90, 0], visibility: "visible" },
    "flip-right": { rotateY: [-90, 0], visibility: "visible" },
    "flip-up": { rotateX: [90, 0], visibility: "visible" },
    "flip-down": { rotateX: [-90, 0], visibility: "visible" },
    "slide-up": { y: [100, 0], visibility: "visible" },
    "slide-down": { y: [-100, 0], visibility: "visible" },
    "slide-left": { x: [100, 0], visibility: "visible" },
    "slide-right": { x: [-100, 0], visibility: "visible" },
    "disappear-up": { y: "-100%", visibility: "visible" },
    "disappear-down": { y: "100%", visibility: "visible" },
    "disappear-left": { x: "-100%", visibility: "visible" },
    "disappear-right": { x: "100%", visibility: "visible" },
  };
  const duration = 0.3;
  const repeat = 0;

  const runAnimation = (
    target: HTMLElement,
    animationKey: string,
    delay = 0
  ) => {
    const animation = animations[animationKey];
    animate(target, animation, {
      type: "tween",
      duration: duration,
      delay: delay,
    });
  };

  const checkAndRunAnimation = (element: HTMLElement) => {
    const animationClass = Array.from(element.classList).find((cls) =>
      Object.keys(animations).some((key) => cls === `animation-${key}`)
    );

    if (animationClass) {
      const animationKey = animationClass.replace("animation-", "");
      const delayClass = Array.from(element.classList).find((cls) =>
        cls.startsWith("animation-delay-")
      );
      const delay = delayClass
        ? parseInt(delayClass.split("-").pop() || "0") / 1000
        : 0;

      runAnimation(element, animationKey, delay);
    }
  };

  const observeModalOpenState = () => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "class"
        ) {
          console.log("mutation", mutation.target);
          const target = mutation.target;
          if (
            (target as HTMLElement).classList.contains("animations-activate")
          ) {
            (target as HTMLElement)
              .querySelectorAll('[class*="animation-"]')
              .forEach((element) =>
                checkAndRunAnimation(element as HTMLElement)
              );
          }
        }
      });
    });

    document
      .querySelectorAll('.modal, [class*="modal"], .animations-container')
      .forEach((modal) => {
        console.log("observing ", modal);
        observer.observe(modal, {
          attributes: true,
          subtree: false,
          attributeFilter: ["class"],
        });
      });

    return observer;
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (
            entry.isIntersecting &&
            !animatedElements.current.has(entry.target)
          ) {
            checkAndRunAnimation(entry.target as HTMLElement);
            if (!repeat) {
              animatedElements.current.add(entry.target);
            }
          }
        });
      },
      {
        threshold: 0.1, // Adjust this value as needed
      }
    );

    document.querySelectorAll('[class*="animation-"]').forEach((element) => {
      observer.observe(element);
    });

    const modalObserver = observeModalOpenState();

    return () => {
      observer.disconnect();
      modalObserver.disconnect();
    };
  }, [pathname]);

  useEffect(() => {
    if (
      !Object.keys(animations).some((key) =>
        document.querySelector(`.animation-${key}`)
      )
    )
      return;

    const handleClick = (e: MouseEvent) => {
      const el = e.currentTarget;
      if (
        !(el as HTMLElement)?.getAttribute("href")?.startsWith("/") ||
        (el as HTMLElement)?.getAttribute("href") === pathname
      )
        return;

      e.preventDefault();
      const href = (el as HTMLElement)?.getAttribute("href");

      Object.keys(animations).forEach((key) => {
        const reversedAnimation = reverseAnimation(animations[key]);

        document.querySelectorAll(`.animation-${key}`).forEach((target) => {
          //if class block-reverse-animation is present, don't reverse the animation
          if (target.classList.contains("block-reverse-animation")) return;
          animate(target, reversedAnimation, {
            type: "tween",
            duration: duration,
            delay: 0,
          });
        });
      });

      setTimeout(() => {
        // window.location.href = href ?? "";
        router.push(href ?? "");
      }, duration * 1000);
    };

    document.querySelectorAll("a").forEach((el) => {
      el.addEventListener("click", handleClick);
    });

    return () => {
      document.querySelectorAll("a").forEach((el) => {
        el.removeEventListener("click", handleClick);
      });
    };
  }, [pathname]);

  return null;
}

const reverseAnimation = (animation: { [key: string]: any }) => {
  const reversed: { [key: string]: any } = {};
  Object.keys(animation).forEach((key) => {
    if (Array.isArray(animation[key])) {
      reversed[key] = [...animation[key]].reverse();
    } else {
      reversed[key] = animation[key];
    }
  });
  return reversed;
};
