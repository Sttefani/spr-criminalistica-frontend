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

  // Título menor
  doc.setFontSize(16);
  doc.text(title, 14, 15);

  // Dados principais - tabela mais compacta
  autoTable(doc, {
    startY: 25,
    head: [['Campo', 'Detalhe']],
    body: [
      ['Data/Hora', new DatePipe('en-US').transform(this.data.occurrenceDate, 'dd/MM/yyyy HH:mm')],
      ['Procedimento', `${this.data.procedure?.name || '-'} (${this.data.procedureNumber || 'N/A'})`],
      ['Classificação', this.data.occurrenceClassification?.name || '-'],
      ['Cidade', `${this.data.city?.name || '-'} - ${this.data.city?.state || ''}`],
      ['Status', this.data.status.replace('_', ' ')],
      ['Unidade', this.data.requestingUnit?.name || '-'],
      ['Autoridade', this.data.requestingAuthority?.name || '-'],
      ['Perito', this.data.responsibleExpert?.name || 'Não Atribuído'],
      ['Serviço', this.data.forensicService?.name || '-'],
      ['Registrado por', this.data.createdBy?.name || '-'],
    ],
    theme: 'grid',
    styles: {
      fontSize: 9,
      cellPadding: 2
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 35 },
      1: { cellWidth: 145 }
    }
  });

  let currentY = (doc as any).lastAutoTable.finalY;

  // Informações de Finalização - compacta
  if (this.data.status === 'CONCLUIDA' || this.data.status === 'CANCELADA') {
    const statusFinal = this.data.status === 'CONCLUIDA' ? 'Concluída' : 'Cancelada';
    const dataFinalizacao = new DatePipe('en-US').transform(this.data.updatedAt, 'dd/MM/yyyy HH:mm');

    doc.setFontSize(12);
    doc.text('Finalização', 14, currentY + 8);

    const finalizationBody = [
      ['Status Final', statusFinal],
      ['Data', dataFinalizacao || '-']
    ];

    if (this.data.statusChangeObservations) {
      finalizationBody.push(['Observações', this.data.statusChangeObservations]);
    }

    autoTable(doc, {
      startY: currentY + 12,
      head: [['Campo', 'Info']],
      body: finalizationBody,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 2
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 25 },
        1: { cellWidth: 155 }
      }
    });

    currentY = (doc as any).lastAutoTable.finalY;
  }

  // Histórico - mais compacto
  doc.setFontSize(11);
  doc.text('Histórico', 14, currentY + 8);
  doc.setFontSize(8);

  // Quebrar texto em múltiplas linhas se necessário
  const splitHistory = doc.splitTextToSize(this.data.history, 180);
  doc.text(splitHistory, 14, currentY + 14);

  // Calcular altura do texto do histórico
  const historyHeight = splitHistory.length * 3;
  currentY += 14 + historyHeight;

  // Campos Adicionais - compactos
  if (this.hasAdditionalFields()) {
    doc.setFontSize(11);
    doc.text('Campos Adicionais', 14, currentY + 5);

    autoTable(doc, {
      startY: currentY + 9,
      head: [['Campo', 'Valor']],
      body: this.getAdditionalFields().map(f => [f.key, String(f.value)]),
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 2
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 35 },
        1: { cellWidth: 145 }
      }
    });
  }

  // Rodapé
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(7);
  doc.text(
    `Gerado em: ${new DatePipe('en-US').transform(new Date(), 'dd/MM/yyyy HH:mm')}`,
    14,
    pageHeight - 10
  );

  doc.save(`ocorrencia_${this.data.caseNumber}.pdf`);
}
}
