import { defineStackbitConfig } from '@stackbit/types';

export default defineStackbitConfig({
    stackbitVersion: "~0.6.0",
    nodeVersion: "18",
    ssgName: "astro",
    devCommand: "npm run dev",
    buildCommand: "npm run build",
    installCommand: "npm install",
    modelExtensions: [
        { name: "Page", type: "page", urlPath: "/{slug}" },
        { name: "Blog", type: "page", urlPath: "/blog/{slug}" }
    ],
    postInstallCommand: "npm i --no-save @stackbit/types"
});
