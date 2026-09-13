import { chromium, Browser, BrowserContext, Page } from 'playwright';
import { logger } from '../../config/logger';

export interface PageSnapshot {
  url: string;
  title: string | null;
  links: string[];
  components: Array<{ name: string | null; selector: string; type: string }>;
  text: string;
}

export interface WorkflowSnapshot {
  name: string;
  steps: unknown[];
}

let browser: Browser | null = null;

const getBrowser = async (): Promise<Browser> => {
  if (!browser) {
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  }
  return browser;
};

const getSelectorFor = (element: Page['locator']) => {
  void element;
  return '';
};

export const browserService = {
  async newContext(): Promise<BrowserContext> {
    const browserInstance = await getBrowser();
    return browserInstance.newContext({
      viewport: { width: 1280, height: 800 },
      deviceScaleFactor: 1,
      locale: 'en-US',
    });
  },

  async closeContext(context: BrowserContext): Promise<void> {
    await context.close();
  },

  async navigate(context: BrowserContext, url: string): Promise<PageSnapshot> {
    const page = await context.newPage();
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(800);

      const title = (await page.title()).slice(0, 300) || null;
      const links = await page.$$eval('a[href]', (anchors) =>
        anchors.map((a) => (a as HTMLAnchorElement).href).filter(Boolean)
      );
      const components = await page.evaluate(() => {
        const buildCssSelector = (element: Element): string | null => {
          if (element.id) {
            return `#${CSS.escape(element.id)}`;
          }
          if (element.hasAttribute('data-testid')) {
            return `[data-testid="${CSS.escape(element.getAttribute('data-testid') ?? '')}"]`;
          }
          const path: string[] = [];
          let current: Element | null = element;
          while (current && current !== document.body && path.length < 8) {
            let segment = current.tagName.toLowerCase();
            if (current.id) {
              segment = `${segment}#${CSS.escape(current.id)}`;
            } else {
              const parent = current.parentElement;
              if (parent) {
                const siblings = Array.from(parent.children).filter(
                  (child) => child.tagName === (current as Element).tagName
                );
                if (siblings.length > 1) {
                  segment = `${segment}:nth-of-type(${siblings.indexOf(current) + 1})`;
                }
              }
            }
            path.unshift(segment);
            current = current.parentElement;
          }
          const selector = path.join(' > ');
          if (!selector) return null;
          return selector.slice(0, 200);
        };

        const results: Array<{ name: string | null; selector: string; type: string }> = [];
        const seen = new Set<string>();
        const visits = (element: Element) => {
          const tag = element.tagName.toLowerCase();
          let type: string = tag;
          if (tag === 'input' || tag === 'textarea' || tag === 'select' || tag === 'button') {
            type = tag;
          } else if (tag === 'a') {
            type = 'link';
          } else if (tag === 'form') {
            type = 'form';
          } else if (tag === 'table') {
            type = 'table';
          } else if (tag === 'img') {
            type = 'image';
          } else if (tag === 'nav') {
            type = 'navigation';
          } else if (element.hasAttribute('role')) {
            type = `role:${element.getAttribute('role')}`;
          }
          const interesting = ['input', 'textarea', 'select', 'button', 'a', 'form', 'table', 'nav'].includes(tag) || element.hasAttribute('role');
          if (interesting) {
            const selector = buildCssSelector(element);
            if (selector && !seen.has(selector)) {
              seen.add(selector);
              const name = element.getAttribute('aria-label') || element.getAttribute('name') || element.textContent?.trim()?.slice(0, 80);
              results.push({ name: name || null, selector, type });
            }
          }
          for (const child of Array.from(element.children)) {
            if (results.length < 200) visits(child);
          }
        };
        visits(document.body);
        return results;
      });

      const text = (await page.evaluate(() => document.body?.innerText ?? '')).slice(0, 100000);

      return { url: page.url(), title, links: Array.from(new Set(links)).slice(0, 200), components, text };
    } catch (error) {
      logger.error({ url, err: error }, 'browser navigate failed');
      throw error;
    } finally {
      await page.close();
    }
  },

  async discoverWorkflows(_context: BrowserContext, _baseUrl: string): Promise<WorkflowSnapshot[]> {
    return [];
  },

  getSelectorFor,

  async close(): Promise<void> {
    if (browser) {
      await browser.close();
      browser = null;
    }
  },
};