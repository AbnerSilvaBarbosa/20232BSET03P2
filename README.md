# 20232BSET03P2 - Abner
Inteli - Engenharia de Software | Avaliação 2023-2B P2

## Vulnerabilidades encontradas

### Vulnerabilidade 1 (Construção da tabela)

No momento que é criado a tabela de dogs e cats o id é apenas um valor int sem autoincrement, além de a tabela não identificar como um id, gerando problemas futuros como inserção direta do id, além de dificultar quando for realizar um join nas tabelas caso o sistema venha evoluir

<strong>Solução</strong>

Modifiquei a forma como ta sendo criado as tabelas.

```js
db.serialize(() => {
  db.run("CREATE TABLE cats (id INTEGER PRIMARY KEY, name TEXT, votes INT)");
  db.run("CREATE TABLE dogs (id INTEGER PRIMARY KEY, name TEXT, votes INT)");
});
```

### Vulnerabilidade 2 (Validação do name nas rotas de inserção)

As rotas não possuem nenhuma validação de sql injection, valor presente ou até mesmo o tamanho dele, gerando assim N brechas de fazer a aplicação cair ou para de funcionar.


<strong>Solução</strong>

Implementei validações nas rotas para prevenir inserções erradas ou que estejam com algum problema

```js
  // Validação do input em si, se vem com algum valor presente
  if(name.length === 0 || name.length < 2){
    return res.status(400).json({ message: "Nome inválido !!" });
  }

  // Implementado o REGEX para validar < > = e ' ' no campo nome
  const nameRegex = /[<>= ]/;

  if (nameRegex.test(name)) {
    return res.status(400).json({ message: "Nome inválido !!" });
  }


  // Verificação de existência de dados registrado
  if(catsNameArray.includes(name)){
    return res.status(400).json({ message: "Nome de gato já registrado !" });
  }
});
```

### Vulnerabilidade 3 (Validação da rota de adicionar voto)

As rotas não possuem nenhuma validação de sql injection, valor presente ou até mesmo o tamanho dele, gerando assim N brechas de fazer a aplicação cair ou para de funcionar. Nem mesmo possuía validação de valores presentes, podendo acontecer vários problemas futuros ou até mesmo troca nos valores de voto

<strong>Solução</strong>

Implementei validações nas rotas para prevenir inserções erradas ou que estejam com algum problema, além de verificar se o id do animal realmente existe para realizar voto, retornando um erro caso não exista

```js

 const animalType = req.params.animalType;
  const id = parseInt(req.params.id);

    // Validando se os valores realmente estão dentro do esperado de receber
  if(animalType !== 'cats' | 'dogs'){
    return res.status(400).json({ message: "Precisa passar um valor valido do tipo de animal de preferência ( cats ou dogs )" });
  }

    // Verificando se o ID é realmente um valor numero para prevenir erros de inserção
  if (typeof id !== "number") {
    return res.status(400).json({message:"Valor do id invalido"});
  }


    // Verifico se realmente existe esse valor no banco caso não, ele retornara um erro para o usuário
  db.get(`SELECT * FROM ${animalType} WHERE id = ${id}`, (err, rows) => {
    if (err) {
      return res.status(500).json({message:"Erro ao consultar o banco de dados"});
  } else if (!rows) {
      return res.status(404).json({message:"Houve um problema ao registar o voto, tente mais tarde !"});
  }
  })
```

