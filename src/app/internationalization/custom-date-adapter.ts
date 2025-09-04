import { Injectable } from '@angular/core';
import { NativeDateAdapter } from '@angular/material/core';
import { TimezoneService } from '../services/timezone.service';

/**
 * Este adaptador customizado força o MatDatepicker a trabalhar com o fuso horário
 * de Roraima (UTC-4), prevenindo problemas de "um dia a menos" e ajustando
 * automaticamente todas as datas para o horário local de Roraima.
 */
@Injectable()
export class CustomDateAdapter extends NativeDateAdapter {
  constructor(private timezoneService: TimezoneService) {
    super();
  }

  // Este método é chamado quando o usuário digita uma data no formato dd/MM/yyyy
  override parse(value: any): Date | null {
    if ((typeof value === 'string') && (value.indexOf('/') > -1)) {
      const str = value.split('/');
      if (str.length < 3) {
        return null;
      }
      const day = Number(str[0]);
      const month = Number(str[1]) - 1; // Mês no JS é baseado em 0
      const year = Number(str[2]);

      // Cria a data em UTC e depois ajusta para Roraima
      const utcDate = new Date(Date.UTC(year, month, day));
      return this.timezoneService.adjustToRoraima(utcDate);
    }

    const timestamp = typeof value === 'number' ? value : Date.parse(value);
    if (isNaN(timestamp)) {
      return null;
    }

    const date = new Date(timestamp);
    return this.timezoneService.adjustToRoraima(date);
  }

  // Sobrescreve o método para formatar a data para exibição no input
  override format(date: Date, displayFormat: Object): string {
    // Ajusta a data para Roraima antes de formatar
    const adjustedDate = this.timezoneService.adjustToRoraima(date);

    // Retorna a data no formato dd/MM/yyyy
    const day = adjustedDate.getDate().toString().padStart(2, '0');
    const month = (adjustedDate.getMonth() + 1).toString().padStart(2, '0');
    const year = adjustedDate.getFullYear();

    return `${day}/${month}/${year}`;
  }

  // Sobrescreve para retornar datas ajustadas para Roraima
  override today(): Date {
    return this.timezoneService.getCurrentTime();
  }

  // Sobrescreve para criar datas ajustadas para Roraima
  override createDate(year: number, month: number, date: number): Date {
    const newDate = new Date(year, month, date);
    return this.timezoneService.adjustToRoraima(newDate);
  }
}
