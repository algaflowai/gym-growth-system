import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import { FinancialDashboard } from './useFinancialData';

export const useFinancialExport = () => {
  const exportToPDF = (financialData: FinancialDashboard, period?: string) => {
    const doc = new jsPDF();
    let y = 20;
    
    // Título
    doc.setFontSize(20);
    doc.text('Resumo Financeiro', 20, y);
    y += 10;
    
    // Período
    if (period) {
      doc.setFontSize(12);
      doc.text(`Período: ${period}`, 20, y);
      y += 10;
    }
    
    // Cards principais
    doc.setFontSize(14);
    doc.text('Resumo Geral', 20, y);
    y += 10;
    
    doc.setFontSize(10);
    doc.text(`Receita Mensal: R$ ${financialData.cards.receita_mensal.valor.toLocaleString()}`, 20, y);
    y += 7;
    doc.text(`Receita Total: R$ ${financialData.cards.receita_total.valor.toLocaleString()}`, 20, y);
    y += 7;
    doc.text(`Perdas Mensais: R$ ${financialData.cards.perdas_mensais.valor.toLocaleString()}`, 20, y);
    y += 7;
    doc.text(`Assinaturas Ativas: ${financialData.cards.assinaturas_ativas.valor}`, 20, y);
    y += 12;
    
    // Despesas Fixas
    if (financialData.despesas_fixas) {
      doc.setFontSize(14);
      doc.text('Despesas Fixas', 20, y);
      y += 10;
      
      doc.setFontSize(10);
      doc.text(`Total Mensal: R$ ${financialData.despesas_fixas.total_mensal.toLocaleString()}`, 20, y);
      y += 7;
      doc.text(`Total do Período: R$ ${financialData.despesas_fixas.total_periodo.toLocaleString()}`, 20, y);
      y += 12;
      
      // Detalhamento de despesas
      financialData.despesas_fixas.detalhamento.forEach((despesa) => {
        doc.text(`- ${despesa.nome}: R$ ${despesa.valor.toFixed(2)} (Venc: ${despesa.vencimento})`, 25, y);
        y += 7;
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
      });
      y += 5;
    }
    
    // Lucro Líquido
    if (financialData.lucro_liquido) {
      doc.setFontSize(14);
      doc.text('Lucro Líquido', 20, y);
      y += 10;
      
      doc.setFontSize(10);
      doc.text(`Valor: R$ ${financialData.lucro_liquido.valor.toLocaleString()}`, 20, y);
      y += 7;
      doc.text(`Margem: ${financialData.lucro_liquido.margem.toFixed(1)}%`, 20, y);
      y += 12;
    }
    
    // Métricas de Parcelas
    if (financialData.metricas_parcelas) {
      doc.setFontSize(14);
      doc.text('Métricas de Parcelas', 20, y);
      y += 10;
      
      doc.setFontSize(10);
      doc.text(`A Receber Este Mês: R$ ${(financialData.metricas_parcelas.a_receber_este_mes || 0).toLocaleString()}`, 20, y);
      y += 7;
      doc.text(`Próximos 7 Dias: R$ ${(financialData.metricas_parcelas.a_receber_proximos_7_dias || 0).toLocaleString()}`, 20, y);
      y += 7;
      doc.text(`Atrasado: R$ ${(financialData.metricas_parcelas.total_atrasado || 0).toLocaleString()}`, 20, y);
      y += 7;
      doc.text(`Recebido no Mês: R$ ${(financialData.metricas_parcelas.receita_recebida_mes || 0).toLocaleString()}`, 20, y);
      y += 7;
      doc.text(`Taxa de Inadimplência: ${(financialData.metricas_parcelas.taxa_inadimplencia || 0).toFixed(1)}%`, 20, y);
    }
    
    doc.save(`resumo-financeiro-${Date.now()}.pdf`);
  };

  const exportToExcel = (financialData: FinancialDashboard) => {
    const wb = XLSX.utils.book_new();
    
    // Sheet 1: Resumo
    const resumo = [
      ['Métrica', 'Valor'],
      ['Receita Mensal', `R$ ${financialData.cards.receita_mensal.valor.toLocaleString()}`],
      ['Crescimento Mensal', `${financialData.cards.receita_mensal.crescimento.toFixed(1)}%`],
      ['Receita Total', `R$ ${financialData.cards.receita_total.valor.toLocaleString()}`],
      ['Perdas Mensais', `R$ ${financialData.cards.perdas_mensais.valor.toLocaleString()}`],
      ['Taxa de Perdas', `${financialData.cards.perdas_mensais.percentual.toFixed(1)}%`],
      ['Assinaturas Ativas', financialData.cards.assinaturas_ativas.valor],
      [],
      ['Lucro Líquido', financialData.lucro_liquido ? `R$ ${financialData.lucro_liquido.valor.toLocaleString()}` : 'N/A'],
      ['Margem de Lucro', financialData.lucro_liquido ? `${financialData.lucro_liquido.margem.toFixed(1)}%` : 'N/A'],
    ];
    const ws1 = XLSX.utils.aoa_to_sheet(resumo);
    XLSX.utils.book_append_sheet(wb, ws1, 'Resumo');
    
    // Sheet 2: Despesas Fixas
    if (financialData.despesas_fixas?.detalhamento) {
      const despesas = [
        ['Nome', 'Valor', 'Vencimento', 'Categoria'],
        ...financialData.despesas_fixas.detalhamento.map(d => [
          d.nome, 
          d.valor, 
          d.vencimento, 
          d.categoria
        ]),
        [],
        ['Total Mensal', financialData.despesas_fixas.total_mensal],
        ['Total do Período', financialData.despesas_fixas.total_periodo],
      ];
      const ws2 = XLSX.utils.aoa_to_sheet(despesas);
      XLSX.utils.book_append_sheet(wb, ws2, 'Despesas Fixas');
    }
    
    // Sheet 3: Evolução Financeira
    const evolucao = [
      ['Mês', 'Receita'],
      ...financialData.evolucao_financeira.map(e => [e.mes, e.receita])
    ];
    const ws3 = XLSX.utils.aoa_to_sheet(evolucao);
    XLSX.utils.book_append_sheet(wb, ws3, 'Evolução');
    
    // Sheet 4: Distribuição de Planos
    const planos = [
      ['Plano', 'Assinantes', 'Receita'],
      ...financialData.distribuicao_planos.map(p => [p.plano, p.assinantes, p.receita])
    ];
    const ws4 = XLSX.utils.aoa_to_sheet(planos);
    XLSX.utils.book_append_sheet(wb, ws4, 'Planos');
    
    XLSX.writeFile(wb, `resumo-financeiro-${Date.now()}.xlsx`);
  };

  return { exportToPDF, exportToExcel };
};
