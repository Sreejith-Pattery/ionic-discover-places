import { Injectable } from '@angular/core';
import { CanLoad, Route, UrlSegment, Router, CanActivate, UrlTree, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanLoad, CanActivate {

  constructor(
    private authService: AuthService,
    private router:Router
  ) {}

  canActivate(route:ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    if(!this.authService.userIsAuthenticated){
      this.router.navigateByUrl('/auth');
    }
    return this.authService.userIsAuthenticated;
  }

  canLoad(route: Route, segments: UrlSegment[]): Observable<boolean> | Promise<boolean> | boolean {
    if(!this.authService.userIsAuthenticated){
      this.router.navigateByUrl('/auth');
    }
    return this.authService.userIsAuthenticated;
  }

}
