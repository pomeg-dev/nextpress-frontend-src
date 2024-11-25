export function getNavItems(idString: string, menus: any[]) {
  const regex = /{{nav_id-(\d*)}}/g;
  const found = regex.exec(idString);
  if (found) {
    const id = parseInt(found[1]);
    return menus?.[id];
  }
}