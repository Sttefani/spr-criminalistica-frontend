import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';

// --- 1. IMPORTAÇÕES PARA A TRADUÇÃO ---
import { MatPaginatorIntl } from '@angular/material/paginator';
import { MatPaginatorIntlPtBr } from './internationalization/mat-paginator-intl-ptbr';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),

    // ==========================================================
    // A CORREÇÃO É AQUI
    // Adicionamos a vírgula e colocamos o provider como um novo
    // item no array.
    // ==========================================================
    { provide: MatPaginatorIntl, useClass: MatPaginatorIntlPtBr },
  ]
};
