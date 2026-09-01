# Security Spec for GymBro

## Data Invariants
1. A user document can only be edited by the user themselves, their assigned trainer, or an admin.
2. The `rol` field and `estado_suscripcion` can only be modified by admins, or `estado_suscripcion` by their assigned trainer.
3. `ejercicios` are globally readable, but only writable by admins.
4. `rutinas` and `ejerciciosRutina` can only be created/edited by a trainer or admin, and can only be read by the assigned client, their trainer, or admin.

## Dirty Dozen Payloads
1. A user trying to set their own role to 'admin'.
2. A client trying to change their `estado_suscripcion` to 'activo'.
3. A user trying to edit someone else's profile.
4. A trainer trying to edit a user who is not assigned to them.
5. A user injecting a string > 100 characters into `nombre`.
6. An unauthenticated user reading the `ejercicios` collection.
7. A client trying to modify an `ejercicio`.
8. A client trying to create a `rutina` for themselves.
9. A trainer creating a `rutina` for a client not assigned to them.
10. A user passing a `dni` of invalid type (e.g., number).
11. A user querying `usuarios` collection broadly without restricting to `isOwner` or `id_entrenador == request.auth.uid`.
12. A trainer creating a routine with a negative `dia_semana`.
