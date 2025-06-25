import connect from '../db.js';

export async function listarFuncionarios(req, res) {
  try {
    const conn = await connect();
    const [funcionarios] = await conn.query('SELECT id, nome, email, cargo FROM usuarios WHERE cargo IN ("funcionario", "gerente", "diretor")');
    res.json(funcionarios);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

export async function excluirFuncionario(req, res) {
  const { id } = req.params;
  try {
    const conn = await connect();
    await conn.query('DELETE FROM usuarios WHERE id = ?', [id]);
    res.json({ mensagem: 'Funcionário excluído com sucesso.' });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}
