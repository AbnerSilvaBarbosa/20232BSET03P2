const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(bodyParser.json());


const db = new sqlite3.Database(':memory:');
const catsNameArray = []
const dogsNameArray = []

// Implementado o autoincrement no banco para assim gerar um id automático para cada novo dado
db.serialize(() => {
  db.run("CREATE TABLE cats (id INTEGER PRIMARY KEY, name TEXT, votes INT)");
  db.run("CREATE TABLE dogs (id INTEGER PRIMARY KEY, name TEXT, votes INT)");
});

app.post('/cats', (req, res) => {
  const name = req.body.name;

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

  catsNameArray.push(name)

  // Mudando a forma como é utilizada a função para assim ela garantir que vai inserir um valor em formato string e não algo dentro do código
  db.run(`INSERT INTO cats (name, votes) VALUES (?,0)`,[name], function(err) {
    if (err) {
      res.status(500).send("Erro ao inserir no banco de dados");
    } else {
      res.status(201).json({ id: this.lastID, name, votes: 0 });
    }
  });
});

app.post('/dogs', (req, res) => {

  const name = req.body.name;

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
  if(dogsNameArray.includes(name)){
    return res.status(400).json({ message: "Nome de cachorro já registrado !" });
  }

  dogsNameArray.push(name)

  // Mudando a forma como é utilizada a função para assim ela garantir que vai inserir um valor em formato string e não algo dentro do código
  db.run(`INSERT INTO dogs (name, votes) VALUES (?,0)`,[name], function(err) {
    if (err) {
      res.status(500).send("Erro ao inserir no banco de dados");
    } else {
      res.status(201).json({ id: this.lastID, name, votes: 0 });
    }
  });
  
});

app.post('/vote/:animalType/:id', async (req, res) => {

  const animalType = req.params.animalType;
  const id = parseInt(req.params.id);

  if(animalType !== 'cats' | 'dogs'){
    return res.status(400).json({ message: "Precisa passar um valor valido do tipo de animal de preferência ( cats ou dogs )" });
  }

  if (typeof id !== "number") {
    return res.status(400).json({message:"Valor do id invalido"});
  }

  console.log(id)

  db.get(`SELECT * FROM ${animalType} WHERE id = ${id}`, (err, rows) => {
    if (err) {
      return res.status(500).json({message:"Erro ao consultar o banco de dados"});
  } else if (!rows) {
      return res.status(404).json({message:"Houve um problema ao registar o voto, tente mais tarde !"});
  }
  })

 
  db.run(`UPDATE ${animalType} SET votes = votes + 1 WHERE id = ${id}`);
  return res.status(200).send("Voto computado");
});

app.get('/cats', (req, res) => {
  db.all("SELECT * FROM cats", [], (err, rows) => {
    if (err) {
      res.status(500).send("Erro ao consultar o banco de dados");
    } else {
      res.json(rows);
    }
  });
});

app.get('/dogs', (req, res) => {
  db.all("SELECT * FROM cats", [], (err, rows) => {
    if (err) {
      res.status(500).send("Erro ao consultar o banco de dados");
    } else {
      res.json(rows);
    }
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Ocorreu um erro!');
});

app.listen(port, () => {
  console.log(`Cats and Dogs Vote app listening at http://localhost:${port}`);
});