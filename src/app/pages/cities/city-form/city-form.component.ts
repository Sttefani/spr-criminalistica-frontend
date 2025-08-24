import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// Nosso Serviço
import { CityService } from '../../../services/city.service';

// Imports do Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-city-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule, MatSnackBarModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule,
    MatProgressSpinnerModule, MatIconModule
  ],
  templateUrl: './city-form.html',
  styleUrls: ['./city-form.scss']
})
export class CityFormComponent implements OnInit {
  form!: FormGroup;
  isEditMode = false;
  cityId: string | null = null;
  isLoading = true;
  pageTitle = 'Nova Cidade';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute, // Para ler o ID da URL
    private router: Router,
    private cityService: CityService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      state: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(2)]],
    });

    this.cityId = this.route.snapshot.paramMap.get('id');
    if (this.cityId) {
      this.isEditMode = true;
      this.pageTitle = 'Editar Cidade';
      this.loadCityData(this.cityId);
    } else {
      this.isLoading = false; // Se não for modo de edição, não precisa carregar nada
    }
  }

  loadCityData(id: string): void {
    this.cityService.getCity(id).subscribe({
      next: (city) => {
        this.form.patchValue(city); // Preenche o formulário com os dados da cidade
        this.isLoading = false;
      },
      error: (err) => {
        this.snackBar.open('Falha ao carregar dados da cidade.', 'Fechar', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }

    // Escolhe qual método do serviço chamar com base no modo (criação ou edição)
    const action = this.isEditMode
      ? this.cityService.updateCity(this.cityId!, this.form.value)
      : this.cityService.createCity(this.form.value);

    action.subscribe({
      next: () => {
        this.snackBar.open('Cidade salva com sucesso!', 'Fechar', { duration: 3000 });
        this.router.navigate(['/cities']); // Volta para a lista
      },
      error: (err) => {
        this.snackBar.open('Falha ao salvar a cidade.', 'Fechar', { duration: 3000 });
        console.error('Erro ao salvar cidade:', err);
      }
    });
  }
}
