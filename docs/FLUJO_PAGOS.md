# Flujo de cuotas y cobros

## Código para el estudiante

Cada cargo pendiente tiene un código único (`SA-...`) y un importe registrado en la base de datos. El estudiante consulta ambos en **Mis pagos** y usa el código como referencia al transferir por Yape o banco al destino oficial de la academia. Debe pedir a secretaría los datos oficiales de destino; este sistema no genera ni inventa números de cuenta o teléfonos.

El código identifica la cuota y ayuda a secretaría a aplicarla. No inicia una transferencia ni confirma automáticamente el ingreso. Para automatizar esa confirmación se necesitaría integrar la API oficial de un proveedor de pagos con credenciales de comercio y notificaciones/webhooks; el proyecto no cuenta con esa integración.

## Registro en secretaría

1. Secretaría busca el código y comprueba que coincidan estudiante, curso e importe pendiente.
2. Comprueba que el efectivo se recibió en caja o que el abono de Yape/banco aparece en la cuenta oficial.
3. Registra el importe recibido, selecciona efectivo, Yape o transferencia e ingresa el número de operación para pagos digitales.
4. El backend compara el importe recibido con el cargo. Solo si coinciden marca la cuota como pagada y guarda la fecha, medio, referencia e importe recibido. Si es el pago de matrícula, en la misma transacción activa la matrícula y crea las cuotas mensuales del ciclo.

Las mensualidades programadas usan los importes capturados al registrar la matrícula y se generan después de que el pago inicial haya sido recibido. La clave única de matrícula, tipo y periodo evita duplicar mensualidades.

## Fuente del esquema

`docs/database.sql` es el único archivo fuente del esquema y sus datos iniciales. No se mantienen migraciones SQL separadas. Al instalar o actualizar una base existente, ejecuta ese archivo: incluye cambios idempotentes para agregar los campos de código e importe recibido y admitir Yape. `CREATE TABLE IF NOT EXISTS` no cambia por sí sola tablas preexistentes; las sentencias de actualización del mismo archivo se encargan de esos cambios.
