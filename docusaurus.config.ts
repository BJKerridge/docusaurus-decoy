import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const buildTime = new Date().toLocaleString(); // Or .toISOString() if you prefer UTC format

const config: Config = {
  title: 'DECOY',
  tagline: '',
  favicon: 'img/favicon.ico',

  url: 'https://docs.xdecoyx.com',
  baseUrl: '/',
  organizationName: 'bjkerridge',
  projectName: 'docusaurus-decoy',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/decoySocial.png',
    navbar: {
      title: 'DECOY',
      logo: {
        alt: 'Decoy',
        src: 'img/decoyLogo.png',
        href: 'docs/decoy',
      },
      items: [
        //{to: '/blog', label: 'Timeline', position: 'left'},
        {
          href: 'https://seat.xdecoyx.com/home',
          label: 'SeAT',
          position: 'right',
        },
        {
          href: 'https://zkillboard.com/alliance/99012410/',
          label: 'zKillboard',
          position: 'right',
        },
        {
          href: 'https://forums.eveonline.com/t/decoy/357372',
          label: 'EVE Forum Post',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      copyright: `Updated at ${buildTime}`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
