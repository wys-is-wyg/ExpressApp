class ChannelController{

    constructor(){
        AraDTApp.get('/channels', this.getChannels);
        AraDTApp.post('/channels/add', this.addChannel);
        AraDTApp.post('/channels/update/:channelId', this.updateChannel);
        AraDTApp.post('/channels/delete/:channelId', this.deleteChannel);
        AraDTApp.get('/channel/:channelId', this.showChannel);
        AraDTApp.get('/channels/edit/:channelId', this.editChannel);
    }

    showChannel = async (request, response, next) => {
    }

    getChannels = async (request, response, next) => {
        
        if (!request.session.token) {
           response.redirect('/');
        }

        var currentUser = await AraDTDatabase.firebase.auth().currentUser;

        var users = [];
        await AraDTDatabase.firebaseAdmin.auth().listUsers()
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
        await AraDTDatabase.storage.collection('channels')
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
                response.locals.errors.general = [error.message];
                response.render('channels');
            });


        var ownedChannels = [];
        await AraDTDatabase.storage.collection('channels')
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
            response.locals.errors.general = [error.message];
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
        if (AraDTValidator.isEmpty(request.body.name)) {
            request.session.errors.general = ['You need to add a channel name'];
            response.redirect('/channels');
        }

        var currentUser = await AraDTDatabase.firebase.auth().currentUser;
        var slugName = AraDTValidator.makeSlug(request.body.name);
        var image = '';
        var publicChannel = (request.body.public) ? request.body.public : false;
        var avatar = (request.files && request.files.avatar) ? request.files.avatar : false;
        var users = (request.body.users) ? request.body.users : {};
        
        if (avatar) {
            var { result, validExtension } = AraDTImageUpload.uploadImage(avatar, slugName+currentUser.uid);
            if (validExtension) {
                image = result;
            } else {
                request.session.errors.addChannel = [result];
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
    
        await AraDTDatabase.storage.collection('channels')
            .add(newChannel)
            .then((doc)=>{
                request.session.errors.addChannel = ['Your channel has been created'];
                response.redirect('/channels');
            })
            .catch((error) => {
                request.session.errors.addChannel = [error.message];
                response.redirect('/channels');
            });
    };

    editChannel = async (request, response, next) => {
        
        if (!request.session.token) {
            response.redirect('/');
        }
        var channelId = request.params.channelId;
        
        if (!channelId) {
            request.session.errors.general = ['You need to specifcy channel to edit'];
            response.redirect('/channels');
        }
        
        var channelDoc = AraDTDatabase.storage.collection('channels').doc(channelId);
        var channelToEdit = {};
        await channelDoc.get()
            .then((data) => {
                channelToEdit = {
                    id: data.id,
                    slug: data.data().slug,
                    public: data.data().public,
                    name: data.data().name,
                    image: data.data().image,
                    users: data.data().users,
                    createdAt: data.data().createdAt,
                };
            })
            .catch((error) => {
                request.session.errors.general = ['This channel does not exist'];
                response.redirect('/channels');
            });

        var channelUsers = [];
        var otherUsers = [];
        await AraDTDatabase.firebaseAdmin.auth().listUsers()
            .then((data) => {
                data.users.forEach((datum) => {
                    if (!AraDTValidator.isEmpty(channelToEdit.users) 
                        && channelToEdit.users.includes(datum.uid)) {
                        channelUsers.push({
                            id: datum.uid,
                            name: datum.displayName,
                            image: datum.photoURL,
                        });
                    } else {
                        otherUsers.push({
                            id: datum.uid,
                            name: datum.displayName,
                            image: datum.photoURL,
                        });
                    }
                });
            })
            .catch(function(error) {
                console.log('Error fetching user data:', error);
            });
        response.locals.channelToEdit = channelToEdit;
        response.locals.channelUsers = channelUsers;
        response.locals.otherUsers = otherUsers;
        response.render('channel-edit');
    };

    updateChannel = async (request, response, next) => {
        
        if (!request.session.token) {
            response.redirect('/');
        }
        var channelId = request.params.channelId;
        if (AraDTValidator.isEmpty(request.body.name)) {
            request.session.errors.editChannelErrors = ['You need to specifcy a name'];
            response.redirect('/channels/edit/' + channelId);
        }

        var currentUser = await AraDTDatabase.firebase.auth().currentUser;
        var slugName = AraDTValidator.makeSlug(request.body.name);
        var image = '';
        var publicChannel = (request.body.public) ? request.body.public : false;
        var avatar = (request.files && request.files.avatar) ? request.files.avatar : false;
        var users = (request.body.users) ? request.body.users : {};
        
        if (avatar) {
            var { result, validExtension } = AraDTImageUpload.uploadImage(avatar, slugName+currentUser.uid);
            if (validExtension) {
                image = result;
            } else {
                request.session.errors.editChannelErrors = [result];
                response.redirect('/channels/edit/' + channelId);
            }
        } else {
            image = request.body['current-avatar'];
        }

        var updatedChannel = {
            owner: currentUser.uid,
            name: request.body.name,
            slug: slugName,
            public: publicChannel,
            image: image,
            users: users
        }
    
        
        var channelDoc = AraDTDatabase.storage.collection('channels').doc(channelId);
        var channelToEdit = {};
        await channelDoc.update(updatedChannel)
            .then((doc)=>{
                request.session.errors.editChannelErrors = ['Your channel has been updated'];
                response.redirect('/channels/edit/' + channelId);
            })
            .catch((error) => {
                request.session.errors.editChannelErrors = [error.message];
                response.redirect('/channels/edit/' + channelId);
            });
    };

    deleteChannel = async (request, response, next) => {
        
        if (!request.session.token) {
            response.redirect('/');
        }
        var channelId = request.params.channelId;
        if (AraDTValidator.isEmpty(request.body.name)) {
            request.session.errors.editChannelErrors = ['You need to specifcy a name'];
            response.redirect('/channels/edit/' + channelId);
        }
    }

}
module.exports = ChannelController;