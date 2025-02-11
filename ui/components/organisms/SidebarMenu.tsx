"use client";

import { linkFilter } from "@/utils/url";
import classNames from "classnames";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export function SidebarMenu({
  menuItems,
  path,
}: {
  menuItems: any;
  path: string;
}) {
  return (
    <aside
      className="fixed top-[73px] h-[calc(100vh-73px)] w-[300px] border-r border-black bg-white"
    >
      {menuItems && (
        <nav className="p-4">
          <ul className="flex flex-col gap-1 text-base">
            {menuItems.map(
              (
                item: {
                  url: string;
                  target: string;
                  title: string;
                  classes: string[];
                },
                i: number
              ) => (
                <li
                  key={i}
                  className={classNames(
                    "rounded-sm p-2 border border-transparent hover:border-black",
                    !path && linkFilter(item.url, API_URL) === '/' && "bg-[rgba(0,86,163,0.05)]",
                    path && linkFilter(item.url, API_URL).includes(path) && "bg-[rgba(0,86,163,0.05)]",
                  )}
                  id={linkFilter(item.url, API_URL)}
                >
                  <Link
                    href={linkFilter(item.url, API_URL)}
                    target={item.target}
                    className="block w-full"
                  >
                    {item.title}
                  </Link>
                </li>
              )
            )}
          </ul>
        </nav>
      )}
    </aside>
  );
}