import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import jsPDF from 'jspdf';

export interface ViewMovementsDialogData {
  caseNumber: string;
  movements: any[];
  userRole?: string;
  isSuperAdmin?: boolean;
}

@Component({
  selector: 'app-view-movements-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule
  ],
  templateUrl: './view-movements-dialog.html',
  styleUrls: ['./view-movements-dialog.scss']
})
export class ViewMovementsDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<ViewMovementsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ViewMovementsDialogData
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }

  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  exportToPDF(): void {
  const doc = new jsPDF();
  const pageHeight = doc.internal.pageSize.height;
  let yPosition = 20;

  // Cabeçalho do relatório
  doc.setFontSize(16);
  doc.text('Relatório de Movimentações', 20, yPosition);
  yPosition += 10;

  doc.setFontSize(12);
  doc.text(`Caso: ${this.data.caseNumber}`, 20, yPosition);
  yPosition += 7;
  doc.text(`Total de Movimentações: ${this.data.movements.length}`, 20, yPosition);
  yPosition += 7;
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 20, yPosition);
  yPosition += 15;

  // Linha separadora
  doc.line(20, yPosition, 190, yPosition);
  yPosition += 10;

  // Adicionar cada movimentação
  this.data.movements.forEach((movement, index) => {
    // Verificar se precisa de nova página
    if (yPosition > pageHeight - 40) {
      doc.addPage();
      yPosition = 20;
    }

    // Número e descrição
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`${index + 1}. ${movement.description}`, 20, yPosition);
    yPosition += 7;

    // Metadados
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Realizada por: ${movement.performedBy.name}`, 25, yPosition);
    yPosition += 5;
    doc.text(`Data/Hora: ${this.formatDate(movement.performedAt)}`, 25, yPosition);
    yPosition += 5;

    if (movement.deadline) {
      doc.text(`Prazo: ${this.formatDate(movement.deadline)}`, 25, yPosition);
      yPosition += 5;
    }

    if (movement.wasExtended && movement.extensionJustification) {
      doc.text(`Prorrogação: ${movement.extensionJustification}`, 25, yPosition);
      yPosition += 5;
    }

    if (movement.isSystemGenerated) {
      doc.text('🖥️ Movimentação gerada automaticamente pelo sistema', 25, yPosition);
      yPosition += 5;
    }

    yPosition += 3; // Espaço entre movimentações

    // Linha separadora sutil
    doc.setDrawColor(200, 200, 200);
    doc.line(20, yPosition, 190, yPosition);
    yPosition += 5;
  });

  // Rodapé
  const currentDate = new Date().toLocaleDateString('pt-BR');
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text('Relatório gerado automaticamente pelo Sistema de Movimentações', 20, pageHeight - 15);
  doc.text(`Data de geração: ${currentDate}`, 20, pageHeight - 10);

  // Salvar o PDF
  const fileName = `movimentacoes_${this.data.caseNumber}_${currentDate.replace(/\//g, '-')}.pdf`;
  doc.save(fileName);
}
editMovement(movement: any): void {
  // TODO: Implementar edição de movimentação
  console.log('Editar movimentação:', movement.id);
  alert(`Funcionalidade de editar movimentação ${movement.id} será implementada em breve.`);
}

deleteMovement(movement: any): void {
  // Confirmar antes de deletar
  const confirmDelete = confirm(`Tem certeza que deseja deletar esta movimentação?\n\n"${movement.description}"`);

  if (confirmDelete) {
    // TODO: Chamar serviço para deletar
    console.log('Deletar movimentação:', movement.id);
    alert(`Movimentação ${movement.id} seria deletada aqui. Implementar chamada ao serviço.`);
  }
}

  private generatePrintContent(): string {
    const currentDate = new Date().toLocaleDateString('pt-BR');

    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Relatório de Movimentações - ${this.data.caseNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px; }
          .case-info { background: #f5f5f5; padding: 10px; margin-bottom: 20px; }
          .movement { margin-bottom: 20px; border: 1px solid #ddd; padding: 15px; }
          .movement-header { background: #e3f2fd; padding: 10px; margin: -15px -15px 10px -15px; }
          .movement-meta { font-size: 12px; color: #666; margin-top: 5px; }
          .extension { background: #fff3cd; padding: 8px; margin-top: 10px; border-left: 4px solid #ffc107; }
          .system-generated { background: #e8f5e8; padding: 5px; margin-top: 10px; font-size: 12px; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Relatório de Movimentações</h1>
          <p><strong>Caso:</strong> ${this.data.caseNumber}</p>
          <p><strong>Total de Movimentações:</strong> ${this.data.movements.length}</p>
          <p><strong>Gerado em:</strong> ${currentDate}</p>
        </div>
    `;

    this.data.movements.forEach((movement, index) => {
      html += `
        <div class="movement">
          <div class="movement-header">
            <strong>${index + 1}. ${movement.description}</strong>
          </div>
          <div class="movement-meta">
            <p><strong>Realizada por:</strong> ${movement.performedBy.name}</p>
            <p><strong>Data/Hora:</strong> ${this.formatDate(movement.performedAt)}</p>
            ${movement.deadline ? `<p><strong>Prazo:</strong> ${this.formatDate(movement.deadline)}</p>` : ''}
          </div>
          ${movement.wasExtended ? `
            <div class="extension">
              <strong>⚠️ Prorrogação de Prazo</strong>
              ${movement.extensionJustification ? `<p>${movement.extensionJustification}</p>` : ''}
            </div>
          ` : ''}
          ${movement.isSystemGenerated ? `
            <div class="system-generated">🖥️ Movimentação gerada automaticamente pelo sistema</div>
          ` : ''}
        </div>
      `;
    });

    html += `
        <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #666;">
          <p>Relatório gerado automaticamente pelo Sistema de Movimentações de Ocorrências</p>
        </div>
      </body>
      </html>
    `;

    return html;
  }
}
