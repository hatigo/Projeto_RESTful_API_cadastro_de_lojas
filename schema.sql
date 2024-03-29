create database market_cubos;

create table if not exists usuarios (
    id serial primary key,
    nome text not null,
    nome_loja text not null,
    email text not null unique,
    senha text not null
);

create table if not exists produtos (
  id serial primary key,
  usuario_id integer not null,
  nome text not null,
  quantidade integer not null,
  categoria text not null,
  preco integer not null,
  descricao text,
  imagem text,
  foreign key (usuario_id) references usuarios (id)
  
);
