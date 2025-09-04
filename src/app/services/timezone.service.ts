import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TimezoneService {
  // Roraima está 1 hora atrás de Brasília (UTC-4 vs UTC-3)
  private readonly RORAIMA_OFFSET_HOURS = -1;

  /**
   * Retorna a data/hora atual ajustada para o fuso horário de Roraima
   */
  getCurrentTime(): Date {
    const now = new Date();
    return this.adjustToRoraima(now);
  }

  /**
   * Ajusta uma data qualquer para o fuso horário de Roraima
   */
  adjustToRoraima(date: Date): Date {
    const adjustedDate = new Date(date);
    adjustedDate.setHours(adjustedDate.getHours() + this.RORAIMA_OFFSET_HOURS);
    return adjustedDate;
  }

  /**
   * Converte uma data de Roraima de volta para Brasília (para enviar ao backend)
   */
  adjustToBrasilia(date: Date): Date {
    const adjustedDate = new Date(date);
    adjustedDate.setHours(adjustedDate.getHours() - this.RORAIMA_OFFSET_HOURS);
    return adjustedDate;
  }

  /**
   * Retorna a hora atual de Roraima no formato HH:MM
   */
  getCurrentTimeString(): string {
    const now = this.getCurrentTime();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  /**
   * Cria uma data com horário específico ajustado para Roraima
   */
  createDateWithTime(date: Date, timeString: string): Date {
    const [hours, minutes] = timeString.split(':').map(num => parseInt(num, 10));
    const newDate = new Date(date);
    newDate.setHours(hours, minutes, 0, 0);
    return this.adjustToRoraima(newDate);
  }

  /**
   * Extrai a hora de uma data como string HH:MM (já ajustada para Roraima)
   */
  extractTimeString(date: Date): string {
    const adjustedDate = this.adjustToRoraima(date);
    const hours = adjustedDate.getHours().toString().padStart(2, '0');
    const minutes = adjustedDate.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }
}
