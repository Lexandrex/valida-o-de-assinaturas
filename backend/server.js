import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import connect from './db.js';
import { cadastrarUsuario, loginUsuario } from './controllers/usuariosController.js';
import { listarFuncionarios, excluirFuncionario } from './controllers/funcionariosController.js';

const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());

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

app.get('/api/funcionarios', listarFuncionarios);
app.delete('/api/funcionarios/:id', excluirFuncionario);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor backend rodando na porta ${PORT}`);
});
