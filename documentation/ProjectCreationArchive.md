### Introduction  
This document outlines how the environment was originall created. These are not the steps
to follow when getting your environment running on the existing code base. If you have
just downloaded the code base, you'll want to follow the brief instructions [here](./LoadingYourEnvironment.md).  

### Creating the environment:  
Run the following shell commands:  
```bash
npx create-electron-app@latest polytone --template=vite-typescript

npm install --save react react-dom react-router-dom sqlite3, lucide-react, electron-is-dev

# this is where you would also install @types/vitejs/plugin-react, and wait-on
npm install --save-dev @types/react @types/react-dom @types/sqlite3 
```

Add the last line to `tsconfig.json` so that it looks like this:  
```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "commonjs",
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "noImplicitAny": true,
    "sourceMap": true,
    "baseUrl": ".",
    "outDir": "dist",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "jsx": "react-jsx"
  }
}
```
This allows react to be used correctly in electron with TypeScript.

Also, in order for electron to bundle `sqlite3` correctly into your application, ensure
that `sqlite3` is listed as a `rollupOption` in `vite.main.config.ts`. Because the original
file is empty, my edited `vite.main.config.ts` now looks like this:
```typescript
import { defineConfig } from 'vite';

// https://vitejs.dev/config
export default defineConfig({
    build: {
        rollupOptions: {
            external: [ "sqlite3" ]
        }
    }
});
```

You can now use React and SQLite3 in the application.  

### Running the development environment:  
To run the development app, use this command:  
```bash
npm start
```

This will run the application, including hot-reloading changes to React components.  

### Creating a distributable application  
To package the app into an application you can distribute, run this command:  
```bash
npm run make
```

This will produce the distrubtable in the `out/` directory. The application is in the `.zip` file
for the each operating system. For example, the `.zip` file created on a Mac is found at
`out/make/zip/darwin/x64/<zip-file-name>.zip`. On a Mac, find and double-click the `.zip` file in
Finder. Momentarily, the application will appear. Open the application, and your app will be running.  

### Implementing ToAll's structure  
Inside of the `src/` directory, create the `main/` and `renderer/` directories.  