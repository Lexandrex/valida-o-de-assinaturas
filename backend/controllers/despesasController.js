import multer from 'multer';
import path from 'path';
import connect from '../db.js';
import crypto from 'crypto';

// Configuração do multer para upload de recibos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/recibos/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
export const uploadRecibo = multer({ storage });

export async function cadastrarDespesa(req, res) {
  try {
    const { employee_id, valor, data, descricao } = req.body;
    const recibo_url = req.file ? `/uploads/recibos/${req.file.filename}` : null;
    if (!employee_id || !valor || !data || !recibo_url) {
      return res.status(400).json({ erro: 'Preencha todos os campos obrigatórios.' });
    }
    const conn = await connect();
    await conn.query(
      'INSERT INTO despesas (employee_id, valor, data, descricao, recibo_url) VALUES (?, ?, ?, ?, ?)',
      [employee_id, valor, data, descricao || '', recibo_url]
    );
    res.json({ mensagem: 'Despesa cadastrada com sucesso.' });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

export async function listarDespesasPendentes(req, res) {
  try {
    const conn = await connect();
    const [despesas] = await conn.query(`
      SELECT d.*, u.nome FROM despesas d
      JOIN usuarios u ON d.employee_id = u.id
      WHERE d.status = 'pendente'
      ORDER BY d.data DESC
    `);
    res.json(despesas);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

export async function assinarDespesa(req, res) {
  try {
    const { expense_id } = req.body;
    const usuario_id = req.user && req.user.id;
    if (!expense_id) {
      return res.status(400).json({ erro: 'Informe o ID da despesa.' });
    }
    if (!usuario_id) {
      return res.status(401).json({ erro: 'Usuário não autenticado.' });
    }
    const conn = await connect();
    // Busca dados da despesa
    const [despesas] = await conn.query('SELECT * FROM despesas WHERE id = ?', [expense_id]);
    if (despesas.length === 0) return res.status(404).json({ erro: 'Despesa não encontrada.' });
    const despesa = despesas[0];
    // Busca usuário e chave privada criptografada (base64)
    const [usuarios] = await conn.query('SELECT * FROM usuarios WHERE id = ?', [usuario_id]);
    if (usuarios.length === 0) return res.status(404).json({ erro: 'Usuário não encontrado.' });
    const usuario = usuarios[0];
    if (!usuario.chave_privada_criptografada) return res.status(400).json({ erro: 'Usuário não possui chave privada cadastrada.' });
    // Descriptografa a chave privada (AES-256-CBC + base64)
    const aesKey = crypto.createHash('sha256').update(process.env.AES_SECRET || 'segredo_aes_forte').digest();
    const data = Buffer.from(usuario.chave_privada_criptografada, 'base64').toString('utf-8');
    const [ivB64, encrypted] = data.split(':');
    const iv = Buffer.from(ivB64, 'base64');
    const decipher = crypto.createDecipheriv('aes-256-cbc', aesKey, iv);
    let chavePrivadaPEM = decipher.update(encrypted, 'base64', 'utf8');
    chavePrivadaPEM += decipher.final('utf8');
    // Gera hash da despesa (exemplo: id+valor+data+descricao)
    const dadosParaAssinar = `${despesa.id}|${despesa.valor}|${despesa.data}|${despesa.descricao}`;
    const sign = crypto.createSign('SHA256');
    sign.update(dadosParaAssinar);
    sign.end();
    const assinatura = sign.sign(chavePrivadaPEM, 'base64');
  // Salva assinatura
await conn.query(
  'INSERT INTO assinaturas (expense_id, assinante_id, assinatura, data_assinatura) VALUES (?, ?, ?, NOW())',
  [expense_id, usuario_id, assinatura]
);
// Salva validação e atualiza status ANTES de responder
await conn.query(
  "INSERT INTO validacoes_despesa (expense_id, validador_id, status, data_validacao) VALUES (?, ?, 'validado', NOW())",
  [expense_id, usuario_id]
);
await conn.query("UPDATE despesas SET status = 'validado' WHERE id = ?", [expense_id]);

res.json({ mensagem: 'Despesa assinada com sucesso.', assinatura });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

export async function listarRelatoriosValidados(req, res) {
  try {
    const conn = await connect();
    const [relatorios] = await conn.query(`
      SELECT v.*, d.*, u.nome AS validador_nome
      FROM validacoes_despesa v
      JOIN despesas d ON v.expense_id = d.id
      JOIN usuarios u ON v.validador_id = u.id
      WHERE v.status IN ('validado', 'rejeitado')
      ORDER BY v.data_validacao DESC
    `);
    res.json(relatorios);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}