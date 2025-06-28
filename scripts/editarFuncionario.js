// Script para editar funcionário
window.addEventListener('DOMContentLoaded', async function() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');
  const form = document.getElementById('editarFuncionarioForm');
  const erroDiv = document.getElementById('erro');
  if (!id) {
    erroDiv.textContent = 'ID do funcionário não informado.';
    form.style.display = 'none';
    return;
  }
  // Buscar dados do funcionário
  try {
    const res = await fetch(`http://localhost:4000/api/funcionarios/${id}`);
    if (!res.ok) throw new Error('Funcionário não encontrado');
    const funcionario = await res.json();
    document.getElementById('nome').value = funcionario.nome || '';
    document.getElementById('email').value = funcionario.email || '';
    document.getElementById('cargo').value = funcionario.cargo || '';
  } catch (err) {
    erroDiv.textContent = err.message;
    form.style.display = 'none';
    return;
  }
  // Submeter edição
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    erroDiv.textContent = '';
    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const cargo = document.getElementById('cargo').value;
    try {
      const res = await fetch(`http://localhost:4000/api/funcionarios/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, cargo })
      });
      let data;
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        throw new Error('Resposta inesperada do servidor.');
      }
      if (!res.ok) throw new Error(data.erro || 'Erro ao editar funcionário');
      alert('Funcionário atualizado com sucesso!');
      window.location.href = 'funcionarios.html';
    } catch (err) {
      erroDiv.textContent = err.message;
    }
  });
});
