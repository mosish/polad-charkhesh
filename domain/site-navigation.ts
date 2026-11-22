import type { SiteExtras } from './site-content';

type NavigationItem = SiteExtras['navigation']['items'][number];
export const contactNavigationItem: NavigationItem = {
  id: 'contact', labelEn: 'Contact us', labelFa: 'تماس با ما', href: '/#contact',
};

/** Existing CMS menus also receive Contact immediately after Company, without duplicates. */
export function publicNavigation(items: readonly NavigationItem[]) {
  const isContact = (item: NavigationItem) => item.id === 'contact' || /^\/?#contact$/.test(item.href);
  const contact = items.find(isContact) || contactNavigationItem;
  const navigation = items.filter(item => !isContact(item));
  const about = navigation.findIndex(item => item.id === 'about' || /^\/?#about$/.test(item.href));
  navigation.splice(about < 0 ? navigation.length : about + 1, 0, { ...contact, href: '/#contact' });
  return navigation;
}
