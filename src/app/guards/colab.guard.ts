import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, switchMap, take } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class colabGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.authService.getCurrentUser().pipe(
      take(1),
      switchMap(user => {
        if (!user) {
          this.router.navigate(['/login']); // Si no hay usuario, redirige a otra página
          return [false];
        }
        return this.authService.isColaborador(user.uid);
      }),
      map(isColaborador => {
        if (!isColaborador) {
          this.router.navigate(['/login']); // Si no es administrador, redirige a otra página
        }
        return isColaborador;
      })
    );
  }
}


