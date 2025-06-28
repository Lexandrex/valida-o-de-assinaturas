// Script para submissão de relatório de despesa com upload de recibo
window.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('formDespesa');
  const erroDiv = document.getElementById('erro');
  if (!form) return;
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    erroDiv.textContent = '';
    const formData = new FormData(form);
    try {
      const res = await fetch('http://localhost:4000/api/despesas', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro || 'Erro ao cadastrar despesa');
      alert('Despesa cadastrada com sucesso!');
      form.reset();
    } catch (err) {
      erroDiv.textContent = err.message;
    }
  });
});
