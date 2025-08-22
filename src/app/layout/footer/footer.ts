import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-footer',
  standalone: true, // Confirma que é um componente standalone
  imports: [
    CommonModule,
    MatToolbarModule
  ], // Importa as dependências aqui
  templateUrl: './footer.html',
  styleUrls: ['./footer.scss']
})
export class Footer {
  anoAtual: number = new Date().getFullYear();
}