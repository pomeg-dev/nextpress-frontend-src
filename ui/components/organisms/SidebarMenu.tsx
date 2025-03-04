"use client";

import { linkFilter } from "@/utils/url";
import classNames from "classnames";
import Link from "next/link";
import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export function SidebarMenu({
  menuItems,
  path,
}: {
  menuItems: any;
  path: string;
}) {
  const [menuItemsFiltered, setMenuItems] = useState<any>([]);

  // Add children menu items on mount.
  useEffect(() => {
    if (menuItems) {
      menuItems.forEach((item: any) => {
        // If has post_parent, get Id and add to parent object as child.
        if (item.menu_item_parent && item.menu_item_parent !== "0") {
          const parent = menuItems.find(
            (parent: any) => parent.ID == item.menu_item_parent
          );
          if (parent) {
            if (!parent.children) {
              parent.children = [];
            }

            // Only add if not already in children.
            if (!parent.children.find((child: any) => child.ID === item.ID)) {
              parent.children.push(item);
            }

            // Remove child from main menu.
            const menuItemsFilteredTemp = menuItems.filter(
              (menuItem: any) => menuItem.ID !== item.ID
            );

            setMenuItems(menuItemsFilteredTemp);
          }
        }
      });
    }
  }, []);

  return (
    <aside
      className="fixed top-[73px] h-[calc(100vh-73px)] w-[300px] border-r border-black bg-white"
    >
      {menuItemsFiltered && (
        <nav className="p-4">
          <ul className="flex flex-col gap-1 text-base">
            {menuItemsFiltered.map(
              (
                item: {
                  url: string;
                  target: string;
                  title: string;
                  classes: string[];
                  children: any[];
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

                  {item.children &&
                    <ul className="mt-4 flex flex-col gap-1 text-base">
                      {item.children.map(
                        (
                          child: {
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
                              !path && linkFilter(child.url, API_URL) === '/' 
                                && "bg-[rgba(0,86,163,0.05)]",
                              path && linkFilter(child.url, API_URL).replace(/^\/+|\/+$/g, "") === path 
                                ? "bg-[rgba(0,86,163,0.05)]"
                                : "bg-white",
                            )}
                            id={linkFilter(child.url, API_URL)}
                          >
                            <Link
                              href={linkFilter(child.url, API_URL)}
                              target={child.target}
                              className="block w-full"
                            >
                              {child.title}
                            </Link>
                          </li>
                        )
                      )}
                    </ul>
                  }
                </li>
              )
            )}
          </ul>
        </nav>
      )}
    </aside>
  );
}