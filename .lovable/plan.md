

## Plano de Correção

### Bug 1: Erro ao buscar alunos ("Cannot read properties of null reading 'toLowerCase'")

**Causa**: Em `src/components/StudentsManagement.tsx` (linhas 26–31), o filtro chama `student.name.toLowerCase()` e `student.email.toLowerCase()` sem verificar se os campos são `null`. Vários alunos têm email/CPF nulos (visível no screenshot como "-"), por isso o erro só aparece ao digitar na busca.

**Correção**: Tornar o filtro tolerante a valores nulos:
```ts
const term = searchTerm.toLowerCase();
const filteredStudents = students.filter(student =>
  (student.name?.toLowerCase().includes(term)) ||
  (student.email?.toLowerCase().includes(term)) ||
  (student.cpf?.includes(searchTerm)) ||
  (student.phone?.includes(searchTerm))
);
```

### Bug 2: Permitir editar o valor ao renovar plano

**Arquivo**: `src/components/PlanRenewalModal.tsx`

A função `onRenew` já aceita `planPrice` como parâmetro e o hook `renewEnrollment` o repassa direto para o banco — então não precisa mexer no hook nem em `EnrollmentManagement`.

**Mudanças no modal**:
1. Adicionar estado `customPrice` (string) e flag `priceManuallyEdited`.
2. Quando o usuário escolhe um plano, preencher `customPrice` automaticamente com `selectedPlan.price` — só se ainda não tiver editado manualmente.
3. Adicionar input numérico **"Valor da Renovação (R$)"** abaixo do `Select` de plano, com texto auxiliar:
   > "Valor sugerido pelo plano: R$ X. Altere se necessário."
4. Validar: valor deve ser > 0 antes de habilitar "Confirmar Renovação".
5. Atualizar o card "Preview da Renovação" para exibir o `customPrice` (não mais `previewPlan.price`).
6. Em `handleRenew`, passar `parseFloat(customPrice)` no lugar de `selectedPlan.price` na chamada `onRenew(...)`.
7. Limpar `customPrice` e `priceManuallyEdited` ao fechar/confirmar o modal.

### Arquivos modificados
- `src/components/StudentsManagement.tsx` — filtro tolerante a null
- `src/components/PlanRenewalModal.tsx` — campo de valor editável

