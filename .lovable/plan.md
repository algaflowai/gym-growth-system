

## Plano: Adicionar Campo de Valor Personalizado na Matrícula

### Objetivo
Permitir que o usuário defina um valor customizado ao criar uma matrícula, independente do preço do plano selecionado. O valor informado ficará associado àquela matrícula específica.

### Mudanças

#### 1. `src/components/NewEnrollment.tsx`
- Adicionar campo `customPrice` ao estado do formulário (string, inicialmente vazio)
- Após a seleção do plano, exibir um campo de input numérico "Valor da matrícula (R$)" pré-preenchido com o preço do plano selecionado
- O usuário pode alterar o valor livremente
- Quando um plano é selecionado, o campo é preenchido automaticamente com o preço do plano (se o usuário ainda não editou manualmente)
- Na submissão (`handleSubmit` e `handleUseExistingStudent`), usar `customPrice` ao invés de `selectedPlan.price` para `plan_price` e `titular_price`
- O valor também deve ser usado no cálculo de parcelas quando parcelamento estiver ativo

#### 2. Interface proposta
Abaixo da seleção de plano (RadioGroup), antes do checkbox de Plano Personalizado:

```
Valor da Matrícula (R$) *
[___119.90___]
Valor sugerido pelo plano: R$ 89,00. Altere se necessário.
```

### Detalhes técnicos
- O campo `customPrice` será salvo/carregado do localStorage junto com os demais dados do formulário
- Validação: valor deve ser maior que 0
- Ao trocar de plano, o valor é atualizado automaticamente somente se o usuário não tiver editado manualmente (controlar com flag `priceManuallyEdited`)
- O `plan_price` no enrollment será o valor digitado, não o preço original do plano

### Arquivos modificados
- `src/components/NewEnrollment.tsx`

