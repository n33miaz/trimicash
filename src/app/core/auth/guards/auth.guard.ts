import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AUTH_PORT } from '../../tokens/injection-tokens';

export const authGuard: CanActivateFn = () => {
  const authPort = inject(AUTH_PORT);
  const router = inject(Router);

  if (authPort.current()) {
    return true;
  }

  return router.createUrlTree(['/auth/login']);
};
