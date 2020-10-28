# Google Drive Teams Storage

Um storage simples para fazer upload de arquivos para diretórios compartilhados do Google Drive (Teams) pelo [Multer](https://github.com/expressjs/multer/blob/master/doc/README-pt-br.md).


## O que é Multer?

Multer é um middleware node.js para manipulação de multipart/form-data, que é usado principalmente para enviar arquivos. É escrito no topo do busboy para máxima eficiência.

**NOTA:** O Multer não processará de nenhum formulário que não seja multipart (multipart / form-data).

## Traduções

Esse README também está disponível em outras linguagens.

- [English](../README.md) (English)

## Instalação

```
npm install --save multer-google-drive-teams-storage
```

## Uso

```javascript
const express = require('express');
const multer =  require('multer');
const { uuid } = require('uuidv4');
const { google } = require('googleapis');
const bodyparser = require('body-parser');

const GoogleStorage = require('google-drive-storage');

const auth = new google.auth.GoogleAuth({
    keyFile: './seu-arquivo-de-autenticacao-google.json',
    scopes: [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/drive.appdata',
        'https://www.googleapis.com/auth/drive.readonly',
        'https://www.googleapis.com/auth/drive.metadata.readonly',
        'https://www.googleapis.com/auth/drive.metadata',
        'https://www.googleapis.com/auth/drive.photos.readonly'
    ],
});

const drive = google.drive({version: 'v3', auth });
const app = express();

app.use(bodyparser.urlencoded({ limit: '50mb', extended: false }))

const upload = multer({
    storage: GoogleStorage({
        drive: drive,
        driveId: function (req, file, callback) { 

            const destination = (req) ? req.body.driveId : null;

            callback(null, destination);
        },
        filename: function (req, file, callback) {

            const fileName = `${uuid()}-${file.originalname}`;

            callback(null, fileName);
        },
    })
});

app.post('/upload', upload.single('arquivo'), (req, res) => {

    const {
        originalname,
        fileId
    } = req.file;

    res.send('Arquivo ' + originalname + ' com o id ' + fileId + ' enviado.');
});
```

## API

GoogleDriveTeamsStorage aceita um objeto de opções. Você precisa especificar dois parâmetros obrigatórios nesse objeto.

A seguir estão as opções que você deverá passar para GoogleDriveTeamsStorage.

Chave         | Descrição | Tipo | Requerido |
----------- | ---------- | --------| -------|
drive | Um objeto 'drive' já autenticado pela [googleapis](https://github.com/googleapis). | Objeto | SIM
driveId | Uma função com os parâmetros req, res e callback para especificar o ID do diretório (fornecido pelo Google Drive). Padrão: root | função | SIM
filename | Uma função com os parametrôs req, res e callback para modificar a estratégia do nome do arquivo. Padrão: nome original do arquivo | função | NÃO



## F.A.Q.

### Posso usar esse storage para fazer upload de arquivos fora de um Drive Compartilhado (Team Drive)?

Sim! Mas, isso depende do seu tipo de autenticação. Quando você usa autenticação OAuth você pode fazer upload de arquivos para seu diretório raiz (Meu drive).

### Que tipo de autenticação eu posso usar?

Você pode se autenticar no google por OAuth ou por Service Account. No exemplo da seção 'Uso' eu autentiquei por Service Account. Quando você se autenticar por Service Account, você precisa criar o Drive Compartilhado (Team Drive) e dar permissão para o Service Account acessá-lo.

## Licença

[MIT](https://github.com/expressjs/multer/blob/master/LICENSE)