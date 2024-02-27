import { Injectable, OnInit } from "@angular/core";

@Injectable({
  providedIn: 'root'
})

export class SidebarService implements OnInit {
    // Propriedade para armazenar a imagem de perfil padrão
    defaultProfileImg = '/assets/icon-profile.svg';
    // Propriedade para armazenar a imagem de perfil para o hover
    hoverProfileImg = '/assets/icon-profile-hover.svg';
    // Propriedade para alternar entre as imagens
    currentProfileImg!: string;
    isHovering: boolean = false;
  
    ngOnInit() {
      // Inicializa com a imagem padrão
      this.currentProfileImg = this.defaultProfileImg;
  
      // Outras inicializações...
    }
  
    onMouseEnter(): void {
      // Muda para a imagem de hover quando o mouse entra
      this.currentProfileImg = this.hoverProfileImg;
    }
  
    onMouseLeave(): void {
      // Volta para a imagem padrão quando o mouse sai
      this.currentProfileImg = this.defaultProfileImg;
    }
  }
  