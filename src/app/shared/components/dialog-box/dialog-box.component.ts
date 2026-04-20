import { Component, Input, ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'app-dialog-box',
    templateUrl: './dialog-box.component.html',
    styleUrls: ['./dialog-box.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: false
})
export class DialogBoxComponent {
  @Input() size: 'small' | 'large' = 'small';
  @Input() hoverable = false;

  constructor() {}
}
