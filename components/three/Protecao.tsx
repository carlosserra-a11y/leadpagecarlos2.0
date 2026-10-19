"use client";

import { Component, type ReactNode } from "react";

/* Se o WebGL não abre (placa bloqueada, aceleração desligada, política da empresa), o three.js lança
   um erro ao criar o renderizador. Sem esta proteção o React desmontaria a página inteira;
   com ela, o 3D some e fica o que estiver por baixo (pôster, carrossel). */
export class Protecao3D extends Component<{ children: ReactNode; onErro?: () => void }, { erro: boolean }> {
  state = { erro: false };
  static getDerivedStateFromError() {
    return { erro: true };
  }
  componentDidCatch() {
    this.props.onErro?.();
  }
  render() {
    return this.state.erro ? null : this.props.children;
  }
}
