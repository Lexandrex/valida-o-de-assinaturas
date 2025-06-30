window.addEventListener('DOMContentLoaded', async function() {
  const container = document.querySelector('.container');
  let html = '<h2>Relatórios Assinados</h2>';
  let backendUrl = '';
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    backendUrl = 'http://localhost:4000';
  } else {
    backendUrl = window.location.origin;
  }
  try {
    const res = await fetch(backendUrl + '/api/relatorios/assinados', {
      headers: {
        'Authorization': 'Bearer ' + (localStorage.getItem('token') || '')
      }
    });
    const relatorios = await res.json();
    if (!Array.isArray(relatorios) || relatorios.length === 0) {
      html += '<div style="margin-top:24px;">Nenhum relatório assinado encontrado.</div>';
    } else {
      html += `<table class="tabela-despesas" style="width:95%;max-width:900px;margin:32px auto 0 auto;">
        <thead>
          <tr>
            <th>Valor</th>
            <th>Data</th>
            <th>Descrição</th>
            <th>Status</th>
            <th>Validador</th>
            <th>Data Validação</th>
          </tr>
        </thead>
        <tbody>`;
      for (const r of relatorios) {
        let dataFormatada = '';
        if (r.data) {
          const dt = new Date(r.data);
          dataFormatada = dt.toLocaleDateString('pt-BR');
        }
        let dataValidacao = '';
        if (r.data_validacao) {
          const dv = new Date(r.data_validacao);
          dataValidacao = dv.toLocaleString('pt-BR');
        }
        html += `<tr>
          <td>R$ ${Number(r.valor).toFixed(2)}</td>
          <td>${dataFormatada}</td>
          <td>${r.descricao || ''}</td>
          <td style="color:${r.status === 'validado' ? 'green' : 'red'};font-weight:bold;">${r.status}</td>
          <td>${r.validador_nome || ''}</td>
          <td>${dataValidacao}</td>
        </tr>`;
      }
      html += '</tbody></table>';
    }
  } catch {
    html += '<div class="erro">Erro ao buscar relatórios assinados.</div>';
  }
  container.innerHTML = html;
});