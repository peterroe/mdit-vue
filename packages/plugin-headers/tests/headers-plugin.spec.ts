import { slugify } from '@mdit-vue/shared';
import type { MarkdownItEnv, MarkdownItHeader } from '@mdit-vue/shared';
import MarkdownIt from 'markdown-it';
import anchorPlugin from 'markdown-it-anchor';
import { describe, expect, it } from 'vitest';
import { headersPlugin } from '../src/index.js';

const fixtures = {
  simpleTree: `\
# h1
## h2
### h3
#### h4
##### h5
###### h6
`,
  complexTree: `\
# s1
## s1-1
### s1-1-1
#### s1-1-1-1
### s1-1-2
### s1-1-3
#### s1-1-3-1
## s1-2
## s1-3
### s1-3-2
#### s1-3-2-1
##### s1-3-2-1-1
##### s1-3-2-1-2
`,
  reversedTree: `\
###### h6
##### h5
#### h4
### h3
## h2
# h1
`,
};

describe('@mdit-vue/plugin-headers > headers-plugin', () => {
  describe('should extract headers with default option (h2, h3)', () => {
    const md = MarkdownIt().use(headersPlugin);

    Object.entries(fixtures).forEach(([name, source]) => {
      it(name, () => {
        const env: MarkdownItEnv = {};
        md.render(source, env);
        expect(env.headers).toMatchSnapshot();
      });
    });
  });

  describe('should extract nothing', () => {
    const md = MarkdownIt().use(headersPlugin, {
      level: [],
    });

    Object.entries(fixtures).forEach(([name, source]) => {
      it(name, () => {
        const env: MarkdownItEnv = {};
        md.render(source, env);
        expect(env.headers).toEqual([]);
      });
    });
  });

  describe('should extract headers (h1, h2, h3, h4)', () => {
    const md = MarkdownIt().use(headersPlugin, {
      level: [1, 2, 3, 4],
    });

    Object.entries(fixtures).forEach(([name, source]) => {
      it(name, () => {
        const env: MarkdownItEnv = {};
        md.render(source, env);
        expect(env.headers).toMatchSnapshot();
      });
    });
  });

  describe('should not include html elements and should not escape texts', () => {
    const md = MarkdownIt({
      html: true,
    })
      .use(anchorPlugin, { slugify })
      .use(headersPlugin, { slugify });

    const testCases: [string, MarkdownItHeader[]][] = [
      // html element should be ignored
      [
        '## foo <bar />',
        [
          {
            level: 2,
            title: 'foo',
            slug: 'foo',
            children: [],
          },
        ],
      ],
      // inline code should not be escaped
      [
        '## foo <bar/> `<code />`',
        [
          {
            level: 2,
            title: 'foo  <code />',
            slug: 'foo-code',
            children: [],
          },
        ],
      ],
      // text should not be escaped
      [
        '## foo <bar/> "baz"',
        [
          {
            level: 2,
            title: 'foo  "baz"',
            slug: 'foo-baz',
            children: [],
          },
        ],
      ],
      // text should not be escaped
      [
        '## < test >',
        [
          {
            level: 2,
            title: '< test >',
            slug: 'test',
            children: [],
          },
        ],
      ],
    ];

    testCases.forEach(([source, expected], i) =>
      it(`case ${i}`, () => {
        const env: MarkdownItEnv = {};
        md.render(source, env);
        expect(env.headers).toEqual(expected);
      }),
    );
  });
});
