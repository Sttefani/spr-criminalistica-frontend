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
  templateUrl: './occurrence-details-dialog.component.html',
  styleUrls: ['./occurrence-details-dialog.component.scss']
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

    doc.setFontSize(10);
    doc.text(this.data.history, 14, lastTableY + 22, { maxWidth: 180 });

    if (this.hasAdditionalFields()) {
        let additionalFieldsY = lastTableY + 22 + 20;
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
