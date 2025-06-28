// Busca e exibe funcionários, permite editar e excluir
window.addEventListener('DOMContentLoaded', async function() {
  const container = document.querySelector('.container');
  let funcionarios = [];
  try {
    const res = await fetch('http://localhost:4000/api/funcionarios');
    funcionarios = await res.json();
  } catch {
    container.innerHTML += '<div class="erro">Erro ao buscar funcionários.</div>';
    return;
  }
  let html = '<h2>Funcionários</h2>';
  html += '<table class="tabela-funcionarios"><thead><tr><th>Nome</th><th>Email</th><th>Cargo</th><th>Ações</th></tr></thead><tbody>';
  for (const f of funcionarios) {
    html += `<tr>
      <td>${f.nome}</td>
      <td>${f.email}</td>
      <td>${f.cargo}</td>
      <td>
        <button onclick="editarFuncionario(${f.id})">Editar</button>
        <button onclick="excluirFuncionario(${f.id})" style="background:#d32f2f;">Excluir</button>
      </td>
    </tr>`;
  }
  html += '</tbody></table>';
  html += '<button onclick="window.location.href=\'dashboard.html\'" style="margin-top:24px;background:#6c757d;">Voltar</button>';
  container.innerHTML = html;
});

window.editarFuncionario = function(id) {
  window.location.href = `editarFuncionario.html?id=${id}`;
};

window.excluirFuncionario = async function(id) {
  if (!confirm('Tem certeza que deseja excluir este funcionário?')) return;
  try {
    const res = await fetch(`http://localhost:4000/api/funcionarios/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Erro ao excluir funcionário');
    location.reload();
  } catch {
    alert('Erro ao excluir funcionário');
  }
};
