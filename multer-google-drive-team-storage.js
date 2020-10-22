function getFilename(req, file, cb) {
    cb(null, file.originalname);
}

function GoogleDriveStorage(opts) {

    this.getFilename = opts.filename || getFilename;

    drive = opts.drive;
    driveId = opts.driveId;
}


GoogleDriveStorage.prototype._handleFile = function _handleFile(req, file, cb) {

    this.getFilename(req, file, function (err, filename) {
        if (err) return cb(err);

        drive.files.create({
            resource: {
                name: filename,
                driveId,
                parents: [driveId],
                mimeType: file.mimetype
            },
            media: {
                body: file.stream
            },
            fields: 'id, name, parents, webViewLink',
            supportsAllDrives: true,
        },
        // Workaround axios' issue of streams incorrect backpressuring, issue: https://github.com/googleapis/google-api-nodejs-client/issues/1107
        { maxRedirects: 0 }
        )
        .then(file => {
            // console.log('File results: ', driveId, parents, file.data.name, file.data.id, file.data.webViewLink);
            cb(null, {
                filename: file.data.name,
                fileId: file.data.id,
                webViewLink: file.data.webViewLink
            });
        })
        .catch(error => {
            cb(error)
        });
    });
};

GoogleDriveStorage.prototype._removeFile = function _removeFile(req, file, cb) {
    drive.files.delete({
        fileId: file
    }).execute((res) => cb);
    
};

module.exports = function (opts) {
    return new GoogleDriveStorage(opts);
};
