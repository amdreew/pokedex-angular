import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-internal-server-error',
    templateUrl: './internal-server-error.component.html',
    styleUrls: ['./internal-server-error.component.scss'],
    standalone: false
})
export class InternalServerErrorComponent {
  constructor(private router: Router) {}

  reload(): void {
    this.router.navigate(['/']).then(() => {
      window.location.reload();
    });
  }
}
