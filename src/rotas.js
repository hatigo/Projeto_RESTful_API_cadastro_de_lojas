const express = require('express');
const { login } = require('./controladores/login');
const usuarios = require('./controladores/usuarios');
const produtos = require('./controladores/produtos');

const rotas = express();

rotas.post('/usuario', usuarios.cadastrarUsuario);
rotas.post('/login', login);
rotas.get('/usuario', usuarios.verPerfil);
rotas.put('/usuario', usuarios.atualizarUsuario);
rotas.get('/produtos', produtos.listarProdutos);
rotas.get('/produtos/:id',produtos.detalharProduto);
rotas.post('/produtos', produtos.cadastrarProduto);
rotas.put('/produtos/:id', produtos.atualizarProduto);
rotas.delete('/produtos/:id', produtos.excluirProduto);

module.exports = rotas;