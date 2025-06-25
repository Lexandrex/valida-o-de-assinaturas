document.getElementById('loginForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;
  const erroDiv = document.getElementById('erro');
  erroDiv.textContent = '';
  try {
    const res = await fetch('http://localhost:4000/api/usuarios/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha })
    });
    const text = await res.text();
    let data = {};
    try {
      data = JSON.parse(text);
    } catch {
      data = { erro: text || 'Erro desconhecido' };
    }
    if (!res.ok) throw new Error(data.erro || 'Erro ao fazer login');
    localStorage.setItem('token', data.token);
    window.location.href = '/pages/dashboard.html';
  } catch (err) {
    erroDiv.textContent = err.message;
  }
});
