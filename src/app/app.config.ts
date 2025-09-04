import { ApplicationConfig, LOCALE_ID, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';

// Imports para tradução
import { MatPaginatorIntl } from '@angular/material/paginator';
import { MatPaginatorIntlPtBr } from './internationalization/mat-paginator-intl-ptbr';

// ==========================================================
// 1. IMPORTAÇÕES PARA O ADAPTADOR CUSTOMIZADO E TIMEZONE
// ==========================================================
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { CustomDateAdapter } from './internationalization/custom-date-adapter';

import { routes } from './app.routes';
import { TimezoneService } from './services/timezone.service';

registerLocaleData(localePt);

// ==========================================================
// 2. DEFINIÇÃO DOS FORMATOS DE DATA (ajustados para Brasil/Roraima)
// ==========================================================
export const APP_DATE_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'dd/MM/yyyy',
    monthYearLabel: 'MMM yyyy',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM yyyy',
  },
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    provideAnimationsAsync(),

    // --- Configuração de Internacionalização (i18n) ---
    { provide: LOCALE_ID, useValue: 'pt-BR' },
    { provide: MatPaginatorIntl, useClass: MatPaginatorIntlPtBr },

    // ==========================================================
    // 3. CONFIGURAÇÃO GLOBAL DO TIMEZONE E MATDATEPICKER
    // ==========================================================
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' },

    // TimezoneService será automaticamente injetado (providedIn: 'root')
    TimezoneService,

    // CustomDateAdapter que usa o TimezoneService
    { provide: DateAdapter, useClass: CustomDateAdapter, deps: [TimezoneService] },
    { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS },
  ]
};
