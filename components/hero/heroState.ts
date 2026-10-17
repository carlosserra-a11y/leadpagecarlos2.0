/* Estado do hero compartilhado entre a interface e o canvas sem passar pelo React
   (muda a cada quadro; re-renderizar seria desperdício). */
export const heroState = {
  /** progresso da rolagem dentro do hero (0 no topo, 1 ao atravessar o horizonte) */
  p: 0,
  /** ponteiro normalizado, -1 a 1 */
  px: 0,
  py: 0,
  /** posição vertical do buraco negro na tela (0 = topo, 1 = base) */
  bhY: 0.34,
  /** o canvas atualiza o anel gótico por aqui (posição e escala na tela) */
  ring: null as HTMLDivElement | null,
};
