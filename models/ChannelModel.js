class ChannelModel{

    constructor(){
        return this;
    }

    getChannelData(datum) {
        return {
            id: datum.id,
            slug: datum.data().slug,
            public: datum.data().public,
            name: datum.data().name,
            image: datum.data().image,
            users: datum.data().users,
            createdAt: datum.data().createdAt,
        }
    }

    editChannel = async (channelId) => {

        var channelDoc = AraDTDatabase.storage.collection('channels').doc(channelId);
        var channelToEdit = {};
        await channelDoc.get()
            .then((datum) => {
                channelToEdit = this.getChannelData(datum);
            })
            .catch(() => {
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

        return{
            channelToEdit,
            channelUsers,
            otherUsers
        }
    }

    updateChannel = async (request, response) => {

        var channelId = request.params.channelId;
        
        if (!channelId) {
            request.session.errors.general = ['You need to specifcy a channel to edit'];
            response.redirect('/channels');
        }

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
        await channelDoc.update(updatedChannel)
            .catch((error) => {
                throw Error(error);
            });
    }

    addChannel = async (request, response) => {
        
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
            .catch((error) => {
                throw Error(error);
            });
    }

    getUserChannels = async () => {
        var currentUser = await AraDTDatabase.firebase.auth().currentUser;
        var users = [];
        var subscribedChannels = await this.getSubscribedChannels(currentUser.uid);
        var ownedChannels = await this.getOwnedChannels(currentUser.uid);
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

        return{
            users,
            subscribedChannels,
            ownedChannels
        }
    }

    getSubscribedChannels = async () => {

        var currentUser = await AraDTDatabase.firebase.auth().currentUser;
        var channels = [];
        await AraDTDatabase.storage.collection('channels')
            .where('users', 'array-contains', currentUser.uid)
            .orderBy('createdAt', 'desc')
            .get()
            .then((data) => {
                data.forEach((datum) => {
                    channels.push(this.getChannelData(datum));
                });
                if (channels.length == 0) {
                    channels = false;
                }
            })
            .catch((error) => {
                console.log('Error fetching channel data:' + error.message);
            });
        return channels;
    }

    getOwnedChannels = async () => {

        var currentUser = await AraDTDatabase.firebase.auth().currentUser;
        var channels = [];
        await AraDTDatabase.storage.collection('channels')
            .where('owner', '==', currentUser.uid)
            .orderBy('createdAt', 'desc')
            .get()
            .then((data) => {
                data.forEach((datum) => {
                    channels.push(this.getChannelData(datum));
                });
                if (channels.length == 0) {
                    channels = false;
                }
            })
            .catch((error) => {
                console.log('Error fetching channel data:' + error.message);
            });
        return channels;
    }
}
module.exports = ChannelModel;