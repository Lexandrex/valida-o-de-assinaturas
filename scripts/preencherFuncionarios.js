// Preenche o select de funcionários e trata o envio do formulário de despesa
window.addEventListener('DOMContentLoaded', async function() {
  const select = document.getElementById('employee_id');
  const erroDiv = document.getElementById('erro');
  // Buscar funcionários para o select
  try {
    const res = await fetch('http://localhost:4000/api/funcionarios');
    const funcionarios = await res.json();
    for (const f of funcionarios) {
      const opt = document.createElement('option');
      opt.value = f.id;
      opt.textContent = `${f.nome} (${f.cargo})`;
      select.appendChild(opt);
    }
  } catch {
    erroDiv.textContent = 'Erro ao carregar funcionários.';
  }

  // Submissão do formulário (já existe em cadastrarDespesa.js)
});
