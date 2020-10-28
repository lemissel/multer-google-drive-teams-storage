# Google Drive Teams Storage

A simple storage to upload files into Google Drive Teams Folders by [Multer](https://github.com/expressjs/multer).


## What's Multer?

Multer is a node.js middleware for handling multipart/form-data, which is primarily used for uploading files. It is written on top of busboy for maximum efficiency.

**NOTE:**  Multer will not process any form which is not multipart (multipart/form-data).

## Translations

This README is also available in others languages.

- [Português](docs/README-pt-br.md) (Português Brasil)

## Installation

```
npm install --save multer-google-drive-teams-storage
```

## Usage

```javascript
const express = require('express');
const multer =  require('multer');
const { uuid } = require('uuidv4');
const { google } = require('googleapis');
const bodyparser = require('body-parser');

const GoogleStorage = require('google-drive-storage');

const auth = new google.auth.GoogleAuth({
    keyFile: './your-google-service-account-key-file.json',
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
        ddriveId: function (req, file, callback) { 

            const destination = (req) ? req.body.driveId : null;

            callback(null, destination);
        },
        filename: function (req, file, callback) {

            const fileName = `${uuid()}-${file.originalname}`;

            callback(null, fileName);
        },
    })
});

app.post('/upload', upload.single('fileField'), (req, res) => {

    const {
        originalname,
        fileId
    } = req.file;

    res.send('File ' + originalname + ' with the id ' + fileId + ' are sent.');
});
```

## API

GoogleDriveTeamsStorage accepts an options object. You need to specify a two required parameters in this object.

The following are the options that should be passaed to GoogleDriveTeamsStorage.

Key         | Decription | Type | Required |
----------- | ---------- | ---- | -------- |
drive | A drive object already authenticated provided by [googleapis](https://github.com/googleapis). | object | YES 
driveId | A function with req, file, and callback params to specify the drive ID (by Google Drive). Default: root | function | YES
filename | A function with req, file and callback params to modifies the strategy of the filename. Default: original filename | function | NO

## IMPORTANT

When you use other fields to specify the 

Part of the multer documentation:

>Note that req.body might not have been fully populated yet. It depends on the order that the client transmits fields and files to the server.

## F.A.Q.

### Can I use this storage to upload file outside a Team Drive?

Yes! But, it's depend of your authentication type. When you use the OAuth authentication you can upload files to you root Google Drive (My Drive).

### What kind of authentication can I use?

You can authenticate to google through OAuth or through Service Account. In the example in the 'Use' section, I authenticated by Service Account. When you authenticate with Service Account, you need to create the Shared Drive (Team Drive) and grant permission for the Service Account to access it.

## Licence

[MIT](https://github.com/expressjs/multer/blob/master/LICENSE)