const conexao = require('../conexao');
const securePassword = require('secure-password');
const jwt = require('jsonwebtoken');
const jwtSecret = require('../jwt_secret');

const pwd = securePassword();

const login = async (req, res) => {
    const { email, senha } = req.body;

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

    try {

        const usuarios = await conexao.query('select * from usuarios where email = $1', [email]);
        if (usuarios.rowCount === 0) {
            return res.status(404).json({
                mensagem: 'Email ou senha incorretos.'
            })
        }

        const usuario = usuarios.rows[0];

        const result = await pwd.verify(Buffer.from(senha), Buffer.from(usuario.senha, 'hex'));

        switch (result) {
            case securePassword.INVALID_UNRECOGNIZED_HASH:
            case securePassword.INVALID:
                return res.status(404).json({
                    mensagem: 'Email ou senha incorretos.'
                })
            case securePassword.VALID:
                break;
            case securePassword.VALID_NEEDS_REHASH:
                try {
                    const hash = (await pwd.hash(Buffer.from(senha))).toString('hex');
                    const query = 'update usuarios set senha = $1 where email = $2';
                    const usuario = await conexao.query(query, [hash, email]);


                } catch {
                }
                break;
        }


        const token = jwt.sign({ id: usuario.id }, jwtSecret, {expiresIn: '1d'});
        
        return res.json({token});

    } catch (error) {
        return res.status(400).json(error.message);
    }





}

module.exports = {
    login
}