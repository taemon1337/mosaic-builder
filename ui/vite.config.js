import { sveltekit } from '@sveltejs/kit/vite';

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [sveltekit()],
  server: {
    proxy: {
      '/auth': 'http://server:3000',
      '/api': 'http://server:3000',
    },
  },
};

export default config;
