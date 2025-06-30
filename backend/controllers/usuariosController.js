// Controlador de usuários: cadastro e login seguro
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import connect from '../db.js';

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
    const [result] = await conn.query('INSERT INTO usuarios (nome, email, senha_hash, cargo) VALUES (?, ?, ?, ?)', [nome, email, senha_hash, cargo]);
    const userId = result.insertId;

    // Gera par de chaves RSA
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 512, // menor, apenas para estudo
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });
    // Criptografa a chave privada antes de salvar
    const chavePrivadaCript = await bcrypt.hash(privateKey, 6); // custo baixo, só para exemplo
    await conn.query('UPDATE usuarios SET chave_publica = ?, chave_privada_criptografada = ? WHERE id = ?', [publicKey, chavePrivadaCript, userId]);

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

export async function gerarChavesUsuario(req, res) {
  try {
    const { id } = req.params;
    // Gera par de chaves RSA
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });

    // Criptografa a chave privada antes de salvar
    const algoritmo = 'aes-256-cbc';
    const key = Buffer.from(process.env.KEY_CRIPTO || '0123456789abcdef0123456789abcdef'); // 32 bytes
    const iv = Buffer.from(process.env.IV_CRIPTO || 'abcdef9876543210'); // 16 bytes
    const cripto = crypto.createCipheriv(algoritmo, key, iv);
    let chavePrivadaCript = cripto.update(privateKey, 'utf8', 'hex');
    chavePrivadaCript += cripto.final('hex');

    const conn = await connect();
    await conn.query('UPDATE usuarios SET chave_publica = ?, chave_privada_criptografada = ? WHERE id = ?', [publicKey, chavePrivadaCript, id]);
    res.json({ mensagem: 'Chaves geradas com sucesso.', chave_publica: publicKey });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}
