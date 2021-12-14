const express = require('express');
const { login } = require('./controladores/login');
const usuarios = require('./controladores/usuarios');

const rotas = express();

rotas.post('/usuario', usuarios.cadastrarUsuario);
rotas.post('/login', login);
rotas.get('/usuario', usuarios.verPerfil);
rotas.put('/usuario', usuarios.atualizarUsuario);
rotas.get('/produtos', usuarios.listarProdutos);
rotas.get('/produtos/:id', usuarios.detalharProduto);
rotas.post('/produtos', usuarios.cadastrarProduto);
rotas.put('/produtos/:id', usuarios.atualizarProduto);
rotas.delete('/produtos/:id', usuarios.excluirProduto);

module.exports = rotas;