import { defineConfig } from 'astro/config'

import yaml from '@rollup/plugin-yaml'

import { fileURLToPath } from 'url'
import { join, dirname } from 'path'

import icon from 'astro-icon'

import preact from '@astrojs/preact';

const __dirname = dirname(fileURLToPath(import.meta.url))

// https://astro.build/config
export default defineConfig({
    devToolbar: {
        enabled: false,
    },

    vite: {
        resolve: {
            alias: {
                '@': join(__dirname, 'src'),
            },
        },
        plugins: [yaml()],
    },

    integrations: [icon(), preact()],
})