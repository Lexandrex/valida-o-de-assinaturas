import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import connect from './db.js';
import { cadastrarUsuario, loginUsuario, gerarChavesUsuario } from './controllers/usuariosController.js';
import { listarFuncionarios, buscarFuncionarioPorId, excluirFuncionario, atualizarFuncionario } from './controllers/funcionariosController.js';
import { cadastrarDespesa, uploadRecibo, listarDespesasPendentes, assinarDespesa } from './controllers/despesasController.js';
import path from 'path';
import { autenticarToken } from './authMiddleware.js';
import { listarRelatoriosValidados } from './controllers/despesasController.js';


const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use('/uploads/recibos', express.static(path.resolve('uploads/recibos')));

app.get('/api/test', async (req, res) => {
  try {
    const conn = await connect();
    const [rows] = await conn.query('SELECT 1 + 1 AS solution');
    res.json({ success: true, result: rows[0].solution });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/usuarios/cadastrar', cadastrarUsuario);
app.post('/api/usuarios/login', loginUsuario);
app.post('/api/usuarios/:id/gerar-chaves', gerarChavesUsuario);

app.get('/api/funcionarios', listarFuncionarios);
app.get('/api/funcionarios/:id', buscarFuncionarioPorId);
app.put('/api/funcionarios/:id', atualizarFuncionario);
app.delete('/api/funcionarios/:id', excluirFuncionario);

app.post('/api/despesas', uploadRecibo.single('recibo'), cadastrarDespesa);
app.post('/api/despesas/assinar', autenticarToken, assinarDespesa);
app.get('/api/despesas/pendentes', listarDespesasPendentes);
app.get('/api/relatorios/assinados', listarRelatoriosValidados);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor backend rodando na porta ${PORT}`);
});
