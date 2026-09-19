import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          login: path.resolve(__dirname, 'login.html'),
          admin: path.resolve(__dirname, 'admin.html'),
          noticias: path.resolve(__dirname, 'noticias.html'),
          cloud: path.resolve(__dirname, 'cloud.html'),
          mural: path.resolve(__dirname, 'mural.html'),
          dashboardAluno: path.resolve(__dirname, 'dashboard-aluno.html'),
          dashboardProfessor: path.resolve(__dirname, 'dashboard-professor.html'),
        },
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
