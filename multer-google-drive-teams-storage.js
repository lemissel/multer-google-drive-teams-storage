function getFilename(req, file, cb) {
    cb(null, file.originalname);
}

function getDriveId(req, file, cb) {
    cb(null, 'root');
}

function GoogleDriveStorage(opts) {

    drive = opts.drive;
    this.getFilename = opts.filename || getFilename;


    // ATTENTION:
    //
    // Fallback to legacy version (v1.0.0) to continue accept string type.
    // This fallback will be deprecated soon
    if (typeof opts.driveId === 'function') {
        this.getDriveId = opts.driveId || getDriveId;
    }
    else {
        GoogleDriveStorage.prototype.driveId = opts.driveId;
    }

    
}


GoogleDriveStorage.prototype._handleFile = function _handleFile(req, file, cb) {

    if (!GoogleDriveStorage.prototype.driveId) {
        this.getDriveId(req, file, (err, driveId) => {
            GoogleDriveStorage.prototype.driveId = driveId;
        });
    }

    this.getFilename(req, file, function (err, filename) {
        if (err) return cb(err);

        drive.files.create({
            resource: {
                name: filename,
                driveId: GoogleDriveStorage.prototype.driveId,
                parents: [GoogleDriveStorage.prototype.driveId],
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
