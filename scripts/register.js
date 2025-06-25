document.getElementById('registerForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const nome = document.getElementById('nome').value;
  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;
  const cargo = document.getElementById('cargo').value;
  const erroDiv = document.getElementById('erro');
  erroDiv.textContent = '';
  try {
    const res = await fetch('http://localhost:4000/api/usuarios/cadastrar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, email, senha, cargo })
    });
    const text = await res.text();
    let data = {};
    try {
      data = JSON.parse(text);
    } catch {
      data = { erro: text || 'Erro desconhecido' };
    }
    if (!res.ok) throw new Error(data.erro || 'Erro ao cadastrar');
    alert('Cadastro realizado com sucesso! Faça login.');
    window.location.href = '/pages/login.html';
  } catch (err) {
    erroDiv.textContent = err.message;
  }
});
