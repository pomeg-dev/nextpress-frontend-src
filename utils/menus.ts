import { MenuItemsProps } from "@/lib/types";

export function getNavItems(idString: string, menus: any[]): null | MenuItemsProps[] {
  const regex = /{{nav_id-(\d*)}}/g;
  const found = regex.exec(idString);
  if (found) {
    const id = parseInt(found[1]);
    let navItems;
    if (Array.isArray(menus[id])) {
      navItems = [...menus[id]];
    } else if (typeof menus[id] === 'object' && menus[id] !== null) {
      navItems = Object.values(menus[id]);
    } else {
      navItems = menus[id] ? [menus[id]] : [];
    }

    const rootItems: MenuItemsProps[] = navItems.filter(
      (item: any) => !item.menu_item_parent || item.menu_item_parent === "0"
    );

    const buildMenuTree = (parentId: string): any[] => {
      const children = navItems.filter(
        (item: any) => item.menu_item_parent === parentId
      );
      
      if (children.length === 0) {
        return [];
      }
      
      return children.map((child: any) => {
        const nestedChildren = buildMenuTree(child.ID.toString());
        if (nestedChildren.length > 0) {
          child.children = nestedChildren;
        }
        return child;
      });
    };

    rootItems.forEach((item: any) => {
      const children = buildMenuTree(item.ID.toString());
      if (children.length > 0) {
        item.children = children;
      }
    });

    return rootItems;
  }
  
  return null;
}