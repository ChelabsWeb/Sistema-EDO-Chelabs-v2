---
description: Turbo mode for autonomous command execution
---

// turbo-all

Este workflow permite que el agente ejecute comandos de terminal (`run_command`) de forma autónoma sin requerir confirmación explícita para cada paso, acelerando significativamente los procesos de desarrollo y despliegue.

### Instrucciones de uso:
1. Al usar comandos de terminal bajo este contexto, el agente marcará `SafeToAutoRun: true`.
2. El agente mantiene la responsabilidad de no ejecutar comandos destructivos o peligrosos.
