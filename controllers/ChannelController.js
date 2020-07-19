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

        var users = [];
        await GulpDatabase.firebaseAdmin.auth().listUsers()
            .then((data) => {
                data.users.forEach((datum) => {
                    if (datum.uid != currentUser.uid) {
                        users.push({
                            id: datum.uid,
                            name: datum.displayName,
                            image: datum.photoURL,
                        });
                    }
                });
                if (users.length == 0) {
                    users = false;
                }
            })
            .catch(function(error) {
                console.log('Error fetching user data:', error);
            });

        var subscribedChannels = [];
        await GulpDatabase.storage.collection('channels')
            .where('users', 'array-contains', currentUser.uid)
            .orderBy('createdAt', 'desc')
            .get()
            .then((data) => {
                data.forEach((datum) => {
                    subscribedChannels.push({
                        id: datum.id,
                        slug: datum.data().slug,
                        public: datum.data().public,
                        name: datum.data().name,
                        image: datum.data().image,
                        createdAt: datum.data().createdAt,
                    });
                });
                if (subscribedChannels.length == 0) {
                    subscribedChannels = false;
                }
                
            })
            .catch((error) => {
                request.session.channelErrors.general = [error.message];
                response.render('channels');
            });


        var ownedChannels = [];
        await GulpDatabase.storage.collection('channels')
        .where('owner', '==', currentUser.uid)
		.orderBy('createdAt', 'desc')
		.get()
		.then((data) => {
			data.forEach((datum) => {
				ownedChannels.push({
                    id: datum.id,
                    slug: datum.data().slug,
                    public: datum.data().public,
                    name: datum.data().name,
                    image: datum.data().image,
					createdAt: datum.data().createdAt,
				});
            });
            if (ownedChannels.length == 0) {
                ownedChannels = false;
            }
            
		})
		.catch((error) => {
            response.locals.channelErrors.general = [error.message];
            response.render('channels');
        });
        response.locals.users = users;
        response.locals.ownedChannels = ownedChannels;
        response.locals.subscribedChannels = subscribedChannels;
        response.render('channels');
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
        var publicChannel = (request.body.public) ? request.body.public : false;
        var avatar = (request.files && request.files.avatar) ? request.files.avatar : false;
        var users = (request.body.users) ? request.body.users : [];
        var users = {};
        
        if (avatar) {
            var { result, validExtension } = GulpImageUpload.uploadImage(avatar, slugName+currentUser.uid);
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
            public: publicChannel,
            image: image,
            users: users,
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

}
module.exports = ChannelController;