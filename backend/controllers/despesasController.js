import multer from 'multer';
import path from 'path';
import connect from '../db.js';

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
