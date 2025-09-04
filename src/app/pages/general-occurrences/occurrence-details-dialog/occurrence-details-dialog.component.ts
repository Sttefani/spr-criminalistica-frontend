import { Component, Inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

// Imports do Material para o Diálogo
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';

// Importa a biblioteca para gerar PDF
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-occurrence-details-dialog',
  standalone: true,
  imports: [
    CommonModule, DatePipe, MatDialogModule, MatButtonModule,
    MatIconModule, MatTooltipModule, MatDividerModule, MatCardModule
  ],
  template: `
    <div class="dialog-header">
      <h1 mat-dialog-title>Detalhes da Ocorrência: {{ data.caseNumber }}</h1>
      <button mat-icon-button (click)="onClose()" matTooltip="Fechar">
        <mat-icon>close</mat-icon>
      </button>
    </div>
    <mat-dialog-content class="mat-typography" id="printable-content">
      <div class="details-grid">
        <!-- Dados Gerais -->
        <mat-card appearance="outlined">
          <mat-card-header><mat-card-title>Dados Gerais</mat-card-title></mat-card-header>
          <mat-card-content>
            <p><strong>Data e Hora do Registro:</strong> {{ data.occurrenceDate | date:'dd/MM/yyyy HH:mm' }}</p>
            <p><strong>Procedimento:</strong> {{ data.procedure?.name || '-' }} ({{ data.procedureNumber || 'N/A' }})</p>
            <p><strong>Classificação:</strong> {{ data.occurrenceClassification?.name || '-' }}</p>
            <p><strong>Cidade:</strong> {{ data.city?.name || '-' }} - {{ data.city?.state || '' }}</p>
            <p><strong>Status:</strong> <span class="status-text">{{ data.status.replace('_', ' ') }}</span></p>
          </mat-card-content>
        </mat-card>

        <!-- Envolvidos -->
        <mat-card appearance="outlined">
          <mat-card-header><mat-card-title>Envolvidos</mat-card-title></mat-card-header>
          <mat-card-content>
            <p><strong>Unidade Demandante:</strong> {{ data.requestingUnit?.name || '-' }}</p>
            <p><strong>Autoridade Requisitante:</strong> {{ data.requestingAuthority?.name || '-' }}</p>
            <p><strong>Perito Responsável:</strong> {{ data.responsibleExpert?.name || 'Não Atribuído' }}</p>
            <p><strong>Serviço Pericial:</strong> {{ data.forensicService?.name || '-' }}</p>
            <p><strong>Registrado Por:</strong> {{ data.createdBy?.name || '-' }}</p>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Histórico -->
      <mat-card appearance="outlined" class="full-width-card">
        <mat-card-header><mat-card-title>Histórico da Ocorrência</mat-card-title></mat-card-header>
        <mat-card-content>
          <p class="history-text">{{ data.history }}</p>
        </mat-card-content>
      </mat-card>

      <!-- Campos Adicionais -->
      @if (hasAdditionalFields()) {
        <mat-card appearance="outlined" class="full-width-card">
          <mat-card-header><mat-card-title>Campos Adicionais</mat-card-title></mat-card-header>
          <mat-card-content>
            <ul>
              @for (field of getAdditionalFields(); track field.key) {
                <li><strong>{{ field.key }}:</strong> {{ field.value }}</li>
              }
            </ul>
          </mat-card-content>
        </mat-card>
      }

      <!-- Metadados -->
      <div class="metadata">
        <span>Criado em: {{ data.createdAt | date:'dd/MM/yyyy HH:mm' }}</span>
        <span>Última Atualização: {{ data.updatedAt | date:'dd/MM/yyyy HH:mm' }}</span>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-stroked-button (click)="onClose()">Fechar</button>
      <button mat-raised-button color="primary" (click)="generatePdf()">
        <mat-icon>print</mat-icon>
        Imprimir em PDF
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-header { display: flex; justify-content: space-between; align-items: center; }
    .details-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px; margin-bottom: 16px; }
    .full-width-card { grid-column: 1 / -1; }
    .history-text { white-space: pre-wrap; }
    .metadata { font-size: 0.8em; color: grey; text-align: center; margin-top: 16px; }
    .status-text { font-weight: bold; }
    mat-card-content p, mat-card-content li { margin-bottom: 8px; }
  `]
})
export class OccurrenceDetailsDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<OccurrenceDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }

  hasAdditionalFields(): boolean {
    return this.data.additionalFields && Object.keys(this.data.additionalFields).length > 0;
  }

  getAdditionalFields(): { key: string; value: any }[] {
    if (!this.hasAdditionalFields()) {
      return [];
    }
    return Object.entries(this.data.additionalFields).map(([key, value]) => ({ key, value }));
  }

  generatePdf(): void {
    const doc = new jsPDF();
    const title = `Relatório da Ocorrência: ${this.data.caseNumber}`;
    doc.setFontSize(18);
    doc.text(title, 14, 20);

    // Corpo do PDF usando autoTable
    autoTable(doc, {
      startY: 30,
      head: [['Campo', 'Detalhe']],
      body: [
        ['Data e Hora', new DatePipe('en-US').transform(this.data.occurrenceDate, 'dd/MM/yyyy HH:mm')],
        ['Procedimento', `${this.data.procedure?.name || '-'} (${this.data.procedureNumber || 'N/A'})`],
        ['Classificação', this.data.occurrenceClassification?.name || '-'],
        ['Cidade', `${this.data.city?.name || '-'} - ${this.data.city?.state || ''}`],
        ['Status', this.data.status.replace('_', ' ')],
        ['Unidade Demandante', this.data.requestingUnit?.name || '-'],
        ['Autoridade Requisitante', this.data.requestingAuthority?.name || '-'],
        ['Perito Responsável', this.data.responsibleExpert?.name || 'Não Atribuído'],
        ['Serviço Pericial', this.data.forensicService?.name || '-'],
        ['Registrado Por', this.data.createdBy?.name || '-'],
      ],
      theme: 'grid'
    });

    const lastTableY = (doc as any).lastAutoTable.finalY;

    // Título da seção Histórico
    doc.setFontSize(12);
    doc.text('Histórico da Ocorrência', 14, lastTableY + 15);

    // ✅ CORREÇÃO: Define um tamanho de fonte menor para a descrição do histórico.
    doc.setFontSize(10);
    doc.text(this.data.history, 14, lastTableY + 22, { maxWidth: 180 });

    if (this.hasAdditionalFields()) {
        let additionalFieldsY = lastTableY + 22 + 20; // Posição inicial baseada no histórico
        // Título da seção Campos Adicionais
        doc.setFontSize(12);
        doc.text('Campos Adicionais', 14, additionalFieldsY);
        autoTable(doc, {
            startY: additionalFieldsY + 7,
            head: [['Chave', 'Valor']],
            body: this.getAdditionalFields().map(f => [f.key, String(f.value)]),
            theme: 'grid'
        });
    }

    doc.save(`ocorrencia_${this.data.caseNumber}.pdf`);
  }
}

