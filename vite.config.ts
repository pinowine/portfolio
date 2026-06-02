import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr';
import { plugin as mdPlugin, Mode } from 'vite-plugin-markdown'
import viteImagemin from 'vite-plugin-imagemin';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    target: 'es2022',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;

          if (
            id.includes('@react-pdf-viewer') ||
            id.includes('pdfjs-dist') ||
            id.includes('react-pdf')
          ) {
            return 'pdf-viewer';
          }

          if (id.includes('yet-another-react-lightbox')) {
            return 'lightbox';
          }

          if (
            id.includes('react-markdown') ||
            id.includes('/remark/') ||
            id.includes('remark-') ||
            id.includes('rehype-') ||
            id.includes('gray-matter') ||
            id.includes('marked') ||
            id.includes('micromark') ||
            id.includes('unified') ||
            id.includes('mdast-util') ||
            id.includes('hast-util') ||
            id.includes('unist-util') ||
            id.includes('vfile') ||
            id.includes('trough') ||
            id.includes('bail') ||
            id.includes('devlop') ||
            id.includes('zwitch') ||
            id.includes('ccount') ||
            id.includes('decode-named-character-reference') ||
            id.includes('property-information') ||
            id.includes('space-separated-tokens') ||
            id.includes('comma-separated-tokens') ||
            id.includes('trim-lines') ||
            id.includes('html-url-attributes')
          ) {
            return 'markdown';
          }

          if (
            id.includes('gsap') ||
            id.includes('lenis') ||
            id.includes('@studio-freight/lenis')
          ) {
            return 'motion';
          }

          if (
            id.includes('@mui') ||
            id.includes('@emotion') ||
            id.includes('@material-tailwind') ||
            id.includes('@adobe') ||
            id.includes('styled-components')
          ) {
            return 'ui-vendor';
          }

          if (id.includes('i18next') || id.includes('react-i18next')) {
            return 'i18n';
          }

          if (
            id.includes('@rive-app') ||
            id.includes('react-modern-audio-player') ||
            id.includes('react-audio-player-component') ||
            id.includes('react-masonry-css') ||
            id.includes('react-lazy-load-image-component')
          ) {
            return 'media-widgets';
          }

          if (id.includes('react-icons')) {
            return 'icons';
          }

          if (id.includes('react-router')) {
            return 'router';
          }

          if (id.includes('fuse.js')) {
            return 'search';
          }

          if (
            id.includes('buffer') ||
            id.includes('base64-js') ||
            id.includes('ieee754') ||
            id.includes('process')
          ) {
            return 'node-polyfills';
          }

          if (
            id.includes('classnames') ||
            id.includes('lodash') ||
            id.includes('imagesloaded')
          ) {
            return 'utils';
          }

          if (id.includes('react') || id.includes('react-dom') || id.includes('scheduler')) {
            return 'react';
          }

          return 'vendor';
        },
      },
    },
  },
  plugins: [
    mdPlugin({
      mode: [Mode.HTML], // This will convert the markdown to HTML for React
    }),
    react({
      include: [/\.tsx$/, /\.md$/], // <-- add .md 
    }),
    svgr({
      svgrOptions: {
        plugins: ["@svgr/plugin-svgo", "@svgr/plugin-jsx"],
        svgoConfig: {
          floatPrecision: 2,
        },
      },
      include: "**/*.svg?react",
    }),
    viteImagemin({
      gifsicle: {
        optimizationLevel: 7,
        interlaced: false,
      },
      optipng: {
        optimizationLevel: 7,
      },
      mozjpeg: {
        quality: 75,
      },
      pngquant: {
        quality: [0.65, 0.9],
        speed: 4,
      },
      svgo: {
        plugins: [
          {
            name: 'removeViewBox',
            active: false,
          },
          {
            name: 'removeEmptyAttrs',
            active: false,
          },
        ],
      },
    }),
  ],
  base: '/',
})
