import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig)
  .then(() => {
    document.querySelector('[data-app-fallback]')?.remove();
    delete document.documentElement.dataset['appStartup'];
  })
  .catch(error => {
    document.documentElement.dataset['appStartup'] = 'failed';
    console.error(error);
  });
