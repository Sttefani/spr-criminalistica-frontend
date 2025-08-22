import { Component } from '@angular/core';
import { Header } from '../header/header';
import { Footer } from '../footer/footer';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [Header, Footer, RouterOutlet],
  templateUrl: './layout.html',
  styleUrls: ['./layout.scss']
})
export class Layout {

}