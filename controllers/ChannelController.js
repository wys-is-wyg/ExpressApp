var Channel = require('../models/ChannelModel');

class ChannelController{

    constructor(){
        this.setVariables();
        GulpApp.get('/channels', this.getChannels);
        GulpApp.post('/channels/add', this.addChannel);
        //GulpApp.post('/channels/update', this.updateChannel);
        //GulpApp.post('/channels/delete', this.deleteChannel);
        //GulpApp.get('/channels/:channelname', this.channel);
    }

    setVariables(){
        GulpApp.use(function(request, response, next) {
            if (request.session) {
                if (request.session.token) {
                    response.locals.loggedin = true;
                }
                if (request.session.channel) {
                    response.locals.channel = request.session.channel;
                }
                if (request.session.channelErrors) {
                    response.locals.channelErrors = request.session.channelErrors;
                } else {
                    response.locals.channelErrors = {};
                }
                request.session.channelErrors = {};

            }
            next();
        });
    }

    getChannels = async (request, response, next) => {
        
        if (!request.session.token) {
            response.redirect('/');
        }

        var currentUser = await GulpDatabase.firebase.auth().currentUser;

        await GulpDatabase.storage.collection('channels')
        .where('owner', '==', currentUser.uid)
		.orderBy('createdAt', 'desc')
		.get()
		.then((data) => {
			let channels = [];
			data.forEach((datum) => {
				channels.push({
                    id: datum.id,
                    slug: datum.data().slug,
                    public: datum.data().public,
                    name: datum.data().name,
                    image: datum.data().image,
					createdAt: datum.data().createdAt,
				});
            });
            if (channels.length == 0) {
                channels = false;
            }
            response.render('channels', {'channels': channels} );
            
		})
		.catch((error) => {
            console.log(error);
            request.session.channelErrors.general = [error.message];
            response.render('channels');
		});
    };

    addChannel = async (request, response, next) => {
        
        if (!request.session.token) {
            response.redirect('/');
        }
        if (GulpValidator.isEmpty(request.body.name)) {
            request.session.channelErrors.addChannel = ['You need to specifcy a name'];
            response.redirect('/channels');
        }

        var currentUser = await GulpDatabase.firebase.auth().currentUser;
        var slugName = GulpValidator.makeSlug(request.body.name);
        var image = '';

        if (request.files.avatar) {
            var { result, validExtension } = GulpImageUpload.uploadImage(request.files.avatar, slugName+currentUser.uid);
            if (validExtension) {
                image = result;
            } else {
                request.session.channelErrors.addChannel = [result];
                response.redirect('/channels');
            }
        }

        var newChannel = {
            owner: currentUser.uid,
            name: request.body.name,
            slug: slugName,
            public: request.body.public,
            image: image,
            createdAt: new Date().toISOString()
        }
    
        await GulpDatabase.storage.collection('channels')
            .add(newChannel)
            .then((doc)=>{
                request.session.channelErrors.addChannel = ['Your channel has been created'];
                response.redirect('/channels');
            })
            .catch((error) => {
                request.session.channelErrors.addChannel = [error.message];
                response.redirect('/channels');
            });
    };

    
    updateAvatar = async (request, response, next) => {
        
        var fs = require('fs');
        var currentChannel = await GulpDatabase.firebase.auth().currentChannel;
        if (currentChannel != null) {
            if(!request.files) {
                request.session.channelErrors.avatar = ['You need to select a suitable file'];
                response.redirect('/account');
            } 
            var extensions = ["png", "jpg", "jpeg", "gif"];
            var ext = this.allowedFile(request.files.avatar.name, extensions);
            if (ext) {
                var newAvatarLocation = '/img/' + currentChannel.uid  + '.' + ext;
                request.files.avatar.mv('./public' + newAvatarLocation);
                await currentChannel.updateProfile({photoURL: newAvatarLocation})
                .then(function() {
                    var currentChannel = GulpDatabase.firebase.auth().currentChannel;
                    if (currentChannel != null) {
                        request.session.channel = currentChannel;
                    }
                    request.session.channelErrors.avatar = ['Your image has been updated.'];
                    response.redirect('/account');
                })
                .catch((error) => {
                    request.session.channelErrors.avatar = [error.message];
                    response.redirect('/account');
                });
            } else {
                request.session.channelErrors.avatar = ["Only allowed filetypes: " + extensions.join(' ')];
                response.redirect('/account');
            }
        } else {
            request.session.genericErrors = ['You have been logged out due to inactivity'];
            this.logout(request, response, next);
        }

    };

    uploadLocalFile(file, channelId){
        var tmp = require('tmp');
        var path = require('path');
        var ext = path.extname(file.name);
        var temp = tmp.fileSync({ mode: '0644', prefix: channelId, postfix: ext });
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
module.exports = ChannelController;