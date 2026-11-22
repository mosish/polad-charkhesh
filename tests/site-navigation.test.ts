import { test } from 'node:test';
import assert from 'node:assert/strict';
import { publicNavigation, contactNavigationItem } from '../domain/site-navigation';
import { siteExtras } from '../domain/site-content';
import { initialPublicHtml } from '../api/seo-html';
import { COMPANY_INFO } from '../domain/company';

void test('existing CMS menus receive one Contact beside Company while retaining custom items and labels', () => {
  const company = siteExtras.navigation.items.find(item => item.id === 'about')!;
  const custom = { id:'resources', labelEn:'Resources', labelFa:'منابع', href:'/resources' };
  const legacy = [custom, company];
  assert.deepEqual(publicNavigation(legacy), [custom, company, contactNavigationItem]);
  assert.deepEqual(legacy, [custom, company]);
  const contact = { ...contactNavigationItem, labelEn:'Talk to our team' };
  const current = [contact, custom, company, { ...contact, id:'contact-duplicate' }];
  assert.deepEqual(publicNavigation(current), [custom, company, contact]);
  assert.deepEqual(publicNavigation(publicNavigation(current)), publicNavigation(current));
});

void test('homepage HTML assigns About to the company section before Contact in both languages', () => {
  const content = { ...siteExtras,
    hero:{titleEn:'Welcome',titleFa:'خوش آمدید'},
    about:{titleEn:'Introduction',titleFa:'مقدمه'},
    why:{titleEn:'About our company',titleFa:'درباره شرکت'},
    contact:{titleEn:'Contact details',titleFa:'اطلاعات تماس'},
  };
  for (const fa of [false,true]) {
    const html = initialPublicHtml('/', fa, {company:COMPANY_INFO,content,products:[]}, false);
    const intro = html.indexOf('<section id="introduction">');
    const catalog = html.indexOf('<section id="catalog">');
    const about = html.indexOf('<section id="about">');
    const contact = html.indexOf('<section id="contact">');
    assert.ok(intro >= 0 && intro < catalog && catalog < about && about < contact);
    assert.equal(html.match(/id="about"/g)?.length, 1);
    assert.ok(html.includes(`<section id="about"><h2>${fa ? 'درباره شرکت' : 'About our company'}</h2>`));
    assert.ok(html.includes(`href="/?lang=${fa ? 'fa' : 'en'}#about"`));
    assert.ok(html.includes(`href="/?lang=${fa ? 'fa' : 'en'}#contact"`));
  }
});
