class ImageUpload{

    uploadImage(image, newName) {
        let result = '';
    
        var extensions = ["png", "jpg", "jpeg", "gif"];
        var validExtension = this.allowedFile(image.name, extensions);
        if (validExtension) {
            var newImageLocation = '/img/' + newName  + '.' + validExtension;
            image.mv('./public' + newImageLocation);
            result = newImageLocation;
        } else {
            result = "Only allowed filetypes: " + extensions.join(' ');
        }
        
        return { result, validExtension };
    }
    
    uploadLocalFile(file, userId){
        var tmp = require('tmp');
        var path = require('path');
        var ext = path.extname(file.name);
        var temp = tmp.fileSync({ mode: '0644', prefix: userId, postfix: ext });
        return temp.name;
    }

    allowedFile(filename, extensions){
        var extExists = extensions.includes(filename.split('.').pop());
        if (extExists) {
            return filename.split('.').pop();
        }
        return false;
    }
}
module.exports = ImageUpload;