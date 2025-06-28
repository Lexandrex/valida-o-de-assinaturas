// Protege o acesso ao CRUD de funcionários: só gerente ou diretor
(function() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'login.html';
    return;
  }
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.cargo !== 'gerente' && payload.cargo !== 'diretor') {
      alert('Acesso restrito! Apenas gerentes ou diretores podem acessar esta página.');
      window.location.href = 'dashboard.html';
    }
  } catch {
    window.location.href = 'login.html';
  }
})();
