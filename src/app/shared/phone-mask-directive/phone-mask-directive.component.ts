import { Directive, HostListener, Input } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appPhoneMask]'
})
export class PhoneMaskDirective {

  @Input() appPhoneMask?: string;

  constructor(public ngControl: NgControl) {}

  @HostListener('input', ['$event'])
  onInputChange(event: any) {
    let newValue = event.target.value.replace(/\D/g, ''); // Remove caracteres não numéricos
    // Trunca o valor para atender ao comprimento máximo
    if (this.appPhoneMask && newValue.length > this.appPhoneMask) {
      newValue = newValue.substr(0, this.appPhoneMask);
    }
    // Aplica a máscara (00) 00000-0000
    newValue = newValue.replace(/^(\d{2})(\d)/g, '($1) $2');
    newValue = newValue.replace(/(\d)(\d{4})$/, '$1-$2');
    this.ngControl.valueAccessor?.writeValue(newValue);
  }
}