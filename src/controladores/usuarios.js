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





module.exports = {
    cadastrarUsuario,
    verPerfil,
    atualizarUsuario,
   
}