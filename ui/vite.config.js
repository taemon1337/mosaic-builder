import { sveltekit } from '@sveltejs/kit/vite';

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [sveltekit()],

	server: {
    cors: {
      origin: "*",
      credentials: true,
    },
		proxy: {
			'/auth': {
        target: 'http://server:3000',
        changeOrigin: true,
      },
			'/api': {
        target: 'http://server:3000',
        changeOrigin: true,
      }
		}
	},

	css: {
		preprocessorOptions: {
			scss: {
				additionalData: '@use "src/variables.scss" as *;'
			}
		}
	}
};

export default config;
