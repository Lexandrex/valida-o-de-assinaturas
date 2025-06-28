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

export async function buscarFuncionarioPorId(req, res) {
  const { id } = req.params;
  try {
    const conn = await connect();
    const [result] = await conn.query('SELECT id, nome, email, cargo FROM usuarios WHERE id = ?', [id]);
    if (result.length === 0) {
      return res.status(404).json({ erro: 'Funcionário não encontrado.' });
    }
    res.json(result[0]);
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

export async function atualizarFuncionario(req, res) {
  const { id } = req.params;
  const { nome, email, cargo } = req.body;
  try {
    const conn = await connect();
    // Monta dinamicamente os campos a serem atualizados
    const campos = [];
    const valores = [];
    if (nome !== undefined) {
      campos.push('nome = ?');
      valores.push(nome);
    }
    if (email !== undefined) {
      campos.push('email = ?');
      valores.push(email);
    }
    if (cargo !== undefined) {
      campos.push('cargo = ?');
      valores.push(cargo);
    }
    if (campos.length === 0) {
      return res.status(400).json({ erro: 'Nenhum campo para atualizar.' });
    }
    valores.push(id);
    const [result] = await conn.query(
      `UPDATE usuarios SET ${campos.join(', ')} WHERE id = ?`,
      valores
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ erro: 'Funcionário não encontrado.' });
    }
    res.json({ mensagem: 'Funcionário atualizado com sucesso.' });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}
