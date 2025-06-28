// Script para listar despesas pendentes
window.addEventListener('DOMContentLoaded', async function() {
  const container = document.querySelector('.container');
  let html = '<h2>Despesas Pendentes</h2>';
  // Detecta backend dinamicamente: se está rodando em localhost, usa 4000, senão usa mesmo domínio
  let backendUrl = '';
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    backendUrl = 'http://localhost:4000';
  } else {
    backendUrl = window.location.origin;
  }
  try {
    const res = await fetch(backendUrl + '/api/despesas/pendentes');
    const despesas = await res.json();
    if (!Array.isArray(despesas) || despesas.length === 0) {
      html += '<div style="margin-top:24px;">Nenhuma despesa pendente encontrada.</div>';
    } else {
      html += '<table class="tabela-despesas" style="width:95%;max-width:900px;margin:32px auto 0 auto;border-collapse:separate;border-spacing:0 10px;box-shadow:0 2px 8px rgba(0,0,0,0.08);background:#fff;">';
      html += '<thead><tr>' +
        '<th style="padding:12px 10px;background:#f4f4f4;">Funcionário</th>' +
        '<th style="padding:12px 10px;background:#f4f4f4;">Valor</th>' +
        '<th style="padding:12px 10px;background:#f4f4f4;">Data</th>' +
        '<th style="padding:12px 10px;background:#f4f4f4;">Descrição</th>' +
        '<th style="padding:12px 10px;background:#f4f4f4;">Recibo</th>' +
      '</tr></thead><tbody>';
      for (const d of despesas) {
        // Formatar data para dd/mm/aaaa
        let dataFormatada = '';
        if (d.data) {
          const dt = new Date(d.data);
          dataFormatada = dt.toLocaleDateString('pt-BR');
        }
        html += `<tr style="border-bottom:1px solid #e0e0e0;">
          <td style="padding:12px 10px;">${d.nome || ''}</td>
          <td style="padding:12px 10px;">R$ ${Number(d.valor).toFixed(2)}</td>
          <td style="padding:12px 10px;">${dataFormatada}</td>
          <td style="padding:12px 10px;max-width:220px;word-break:break-word;">${d.descricao || ''}</td>
          <td style="padding:12px 10px;">${d.recibo_url ? `<a href="${backendUrl}${d.recibo_url}" target="_blank" style="color:#007bff;text-decoration:underline;">Ver Recibo</a>` : '-'}</td>
        </tr>`;
      }
      html += '</tbody></table>';
    }
  } catch {
    html += '<div class="erro">Erro ao buscar despesas pendentes.</div>';
  }
  container.innerHTML = html;
});
