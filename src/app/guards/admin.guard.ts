import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, map, switchMap, take } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class adminGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.authService.getCurrentUser().pipe(
      take(1),
      switchMap(user => {
        if (!user) {
          this.router.navigate(['/home']); // Si no hay usuario, redirige a otra página
          return [false];
        }
        return this.authService.isAdmin(user.uid);
      }),
      map(isAdmin => {
        if (!isAdmin) {
          this.router.navigate(['/home']); // Si no es administrador, redirige a otra página
        }
        return isAdmin;
      })
    );
  }
}


