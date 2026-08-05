/*import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes, 
      withInMemoryScrolling({ scrollPositionRestoration: 'top' })
    ),
    provideRouter(routes),
    provideHttpClient(),
    provideAnimations(),
  ],
};*/

import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    
    // เหลือ provideRouter ไว้แค่อันเดียวที่รวบรวมฟังก์ชันการตั้งค่าทั้งหมดครับ
    provideRouter(
      routes, 
      withInMemoryScrolling({ scrollPositionRestoration: 'top' })
    ),
    
    provideHttpClient(),
    provideAnimations(),
  ],
};
