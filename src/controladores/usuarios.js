const conexao = require('../conexao');
const securePassword = require('secure-password');
const jwt = require('jsonwebtoken');
const jwt_secret = require('../jwt_secret');

const pwd = securePassword();

const verificarDados = async (req, res) => {

    const { nome, email, senha, nome_loja } = req.body;
    if (!nome) {
        return res.status(400).json({
            mensagem: 'O campo nome é obrigatório.'
        })
    }
    if (!email) {
        return res.status(400).json({
            mensagem: 'O campo email é obrigatório.'
        })
    }
    if (!senha) {
        return res.status(400).json({
            mensagem: 'O campo senha é obrigatório.'
        })
    }
    if (!nome_loja) {
        return res.status(400).json({
            mensagem: 'O campo nome_loja é obrigatório.'
        })
    }


    try {

        const usuarios = await conexao.query('select * from usuarios where email = $1', [email]);
        if (usuarios.rowCount > 0) {
            return res.status(400).json({
                mensagem: 'Já existe usuário cadastrado com o e-mail informado.'
            })
        }


    } catch (error) {
        return res.status(400).json(error.message);
    }

}

const validarToken = async (req, res) => {
    const bearerToken = (req.headers.authorization).split('').splice(8);
    bearerToken.pop();
    const token = bearerToken.join('');

    if(!token) {
        return res.status(400).json({mensagem: '"Para acessar este recurso um token de autenticação válido deve ser enviado.'});
    }

    try {
        const { id } = jwt.verify(token, jwt_secret);

        const usuarios = await conexao.query('select * from usuarios where id = $1', [id]);
        if (usuarios.rowCount === 0) {
            return res.status(404).json({
                mensagem: 'usuário não encontrado.'
            })
        }

        return id;

    } catch (error) {
        return res.status(400).json(error.message);
    }

    

}

const cadastrarUsuario = async (req, res) => {
    const { nome, email, senha, nome_loja } = req.body;

    verificarDados(req, res);


    try {
        const hash = (await pwd.hash(Buffer.from(senha))).toString('hex');
        const query = 'insert into usuarios (nome, email, senha, nome_loja) values($1, $2, $3, $4)';
        const usuario = await conexao.query(query, [nome, email, hash, nome_loja]);

        if (usuario.rowCount === 0) {
            return res.status(400).json({ mensagem: 'Não foi possível cadastrar o usuário' });
        }



        return res.status(200).json({
            mensagem: 'usuário cadastrado com sucesso.'
        })

    } catch (error) {
        return res.status(400).json(error.message);
    }





}



const verPerfil = async (req, res) => {

    
    
    try {
        const id = await validarToken(req, res);
    
        const usuarios = await conexao.query('select * from usuarios where id = $1', [id]);
       
        const { senha: senhaUsuario, ...usuario } = usuarios.rows[0];

        return res.json(usuario);


    } catch (error) {
        return res.status(401).json(error.message);
    }


}


const atualizarUsuario = async (req, res) => {

    const { nome, email, senha, nome_loja } = req.body;

    verificarDados(req, res);

   
   

    try {
       
        const id = await validarToken(req, res);

        const hash = (await pwd.hash(Buffer.from(senha))).toString('hex');
        const query = 'update usuarios set nome = $1, email = $2, senha = $3, nome_loja = $4 where id = $5';
        const usuario = await conexao.query(query, [nome, email, hash, nome_loja, id]);

        if (usuario.rowCount === 0) {
            return res.status(400).json({ mensagem: 'Não foi possível cadastrar o usuário' });
        }



        return res.status(200).json({
            mensagem: 'usuário atualizado com sucesso.'
        })





    } catch (error) {
        return res.status(401).json(error.message);
    }

}


const listarProdutos = async (req, res) => {
    const categoria = req.query.categoria;
    
    
    try {
        const id = await validarToken(req, res);
        if(!categoria){
            const {rows: produtos} = await conexao.query('select * from produtos where usuario_id = $1', [id]);
            return res.status(200).json([produtos]);
        }

        const {rows: produtos} = await conexao.query('select * from produtos where usuario_id = $1 and categoria = $2', [id, categoria]);

        return res.status(200).json([produtos]);


    } catch (error) {
        return res.status(401).json(error.message);

    }

}


const detalharProduto = async (req, res) => {
    const produtoId = req.params.id;

    try {
        const id = await validarToken(req, res);

        const {rows, rowCount} = await conexao.query('select * from produtos where usuario_id = $1 and id = $2', [id, produtoId]);
       
        if(rowCount === 0){
            return res.status(404).json({mensagem: 'o produto procurado não existe ou não percente ao usuário logado'})
        }

        const produto = rows[0];
        return res.status(200).json({produto});
        
    } catch (error) {
        return res.status(401).json(error.message);

    }

}


const cadastrarProduto = async (req, res) => {
    const {nome, quantidade,categoria, preco, descricao, imagem} = req.body;

    if (!nome) {
        return res.status(400).json({mensagem: 'O campo nome é obrigatório.'})
    }

    if (!quantidade) {
        return res.status(400).json({mensagem: 'O campo quantidade é obrigatório.'})
    }

    if (!preco) {
        return res.status(400).json({mensagem: 'O campo preco é obrigatório.'})
    }

    if (!descricao) {
        return res.status(400).json({mensagem: 'O campo descricao é obrigatório.'})
    }

    if (quantidade <= 0){
        return res.status(400).json({mensagem: 'para cadastrar um produto sua quantidade deve ser maior que zero.'})

    }

    try {
        const id = await validarToken(req, res);

        const query = 'insert into produtos (usuario_id, nome, quantidade, categoria, preco, descricao, imagem) values($1, $2, $3, $4, $5, $6, $7)';
        const usuario = await conexao.query(query, [id, nome, quantidade, categoria, preco, descricao, imagem]);
    
        return res.status(200).json();
        
    } catch (error) {
        return res.status(401).json(error.message);
    }

}


const atualizarProduto = async (req, res) => {
    const produtoId = req.params.id;
    const {nome, quantidade,categoria, preco, descricao, imagem} = req.body;

    if (!nome) {
        return res.status(400).json({mensagem: 'O campo nome é obrigatório.'})
    }

    if (!quantidade) {
        return res.status(400).json({mensagem: 'O campo quantidade é obrigatório.'})
    }

    if (!preco) {
        return res.status(400).json({mensagem: 'O campo preco é obrigatório.'})
    }

    if (!descricao) {
        return res.status(400).json({mensagem: 'O campo descricao é obrigatório.'})
    }


    try {
        const id = await validarToken(req, res);

        const produtos = await conexao.query('select * from produtos where usuario_id = $1 and id = $2', [id, produtoId]);
        if(produtos.rowCount === 0){
            return res.status(404).json({mensagem: 'o produto procurado não existe ou não percente ao usuário logado'})
        }


        
    } catch (error) {
        return res.status(401).json(error.message);

    }


    try {
        const query = 'update produtos set nome = $1, quantidade = $2, categoria = $3, preco = $4, descricao = $5, imagem = $6 where id = $7';
        const produtos = await conexao.query(query, [nome, quantidade, categoria, preco, descricao, imagem, produtoId]);

        if (produtos.rowCount === 0) {
            return res.status(400).json({ mensagem: 'Não foi possível atualizar o produto' });
        }



        return res.status(200).json({
            mensagem: 'produto atualizado com sucesso.'
        })

        
    } catch (error) {
        return res.status(400).json(error.message);

    }
}


const excluirProduto = async (req, res) => {
    const produtoId = req.params.id;

    try {
        const id = await validarToken(req, res);
        const produtos = await conexao.query('select * from produtos where usuario_id = $1 and id = $2', [id, produtoId]);
        if(produtos.rowCount === 0){
            return res.status(404).json({mensagem: 'o produto procurado não existe ou não percente ao usuário logado'})
        }

        const {rowCount} = await conexao.query('delete from produtos where usuario_id = $1 and id = $2', [id, produtoId]);

        if(rowCount === 0){
           return res.status(400).json({mensagem: 'não foi possivel excluir o produto.'});
        }

        return res.status(200).json();
        
    } catch (error) {
        return res.status(400).json(error.message);

    }

   

}


module.exports = {
    cadastrarUsuario,
    verPerfil,
    atualizarUsuario,
    listarProdutos,
    detalharProduto,
    cadastrarProduto,
    atualizarProduto,
    excluirProduto
}