import { Component,   Input } from '@angular/core';
declare var $: any;

@Component({
  selector: 'app-carrusel',
  standalone: true,
  imports: [],
  templateUrl: './carrusel.component.html',
  styleUrl: './carrusel.component.css'
})
export class CarruselComponent {
  @Input() images: string[] = []; // Lista de imágenes recibida como input
  currentIndex: number = 0; // Índice actual del carrusel
  translateX: number = 0; // Posición de la traducción

  prevSlide(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.updateTranslation();
    }
  }

  nextSlide(): void {
    if (this.currentIndex < this.images.length - 1) {
      this.currentIndex++;
      this.updateTranslation();
    }
  }

  private updateTranslation(): void {
    this.translateX = -this.currentIndex * 100; // Actualiza la posición de la traducción
  }
}
