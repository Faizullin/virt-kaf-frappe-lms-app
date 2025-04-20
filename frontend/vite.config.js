import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import frappeui from 'frappe-ui/vite'

const dev = false;
const server = {
	allowedHosts: ['fs', 'onb1'],
}
if(dev) {
	server.host = '0.0.0.0'
	// server.port = 3000
	server.watch = {
		usePolling: true,
	}
}
	

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		frappeui({
			frappeProxy: true,
			lucideIcons: true,
			jinjaBootData: true,
			frappeTypes: {
				input: {},
			},
			buildConfig: {
				indexHtmlPath: '../lms/www/lms.html',
			},
		}),
		vue({
			script: {
				defineModel: true,
				propsDestructure: true,
			},
		}),
	],
	server: {...server},
	css: {
		preprocessorOptions: {
			scss: {
				additionalData: '@import "@/styles/variables.scss";',
			},
		},
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, 'src'),
			'tailwind.config.js': path.resolve(__dirname, 'tailwind.config.js'),
		},
	},
	optimizeDeps: {
		include: [
			'feather-icons',
			'showdown',
			'engine.io-client',
			'tailwind.config.js',
			'highlight.js',
		],
	},
})
