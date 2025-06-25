// ...arquivo movido para controllers/usuariosController.js...

// Controlador de usuários: cadastro e login seguro
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import connect from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'segredo_super_secreto';

export async function cadastrarUsuario(req, res) {
  const { nome, email, senha, cargo } = req.body;
  if (!nome || !email || !senha || !cargo) {
    return res.status(400).json({ erro: 'Preencha todos os campos.' });
  }
  try {
    const conn = await connect();
    const [usuarios] = await conn.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (usuarios.length > 0) {
      return res.status(400).json({ erro: 'E-mail já cadastrado.' });
    }
    const senha_hash = await bcrypt.hash(senha, 10);
    await conn.query('INSERT INTO usuarios (nome, email, senha_hash, cargo) VALUES (?, ?, ?, ?)', [nome, email, senha_hash, cargo]);
    return res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso.' });
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}

export async function loginUsuario(req, res) {
  const { email, senha } = req.body;
  if (!email || !senha) {
    return res.status(400).json({ erro: 'Preencha todos os campos.' });
  }
  try {
    const conn = await connect();
    const [usuarios] = await conn.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (usuarios.length === 0) {
      return res.status(401).json({ erro: 'Usuário ou senha inválidos.' });
    }
    const usuario = usuarios[0];
    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaValida) {
      return res.status(401).json({ erro: 'Usuário ou senha inválidos.' });
    }
    const token = jwt.sign({ id: usuario.id, cargo: usuario.cargo }, JWT_SECRET, { expiresIn: '1h' });
    return res.json({ token, usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, cargo: usuario.cargo } });
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}
