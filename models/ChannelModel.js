class ChannelModel{

    constructor(){
        return this;
    }

    getChannelUsers = async () => {
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
                throw new Error(['We were unable to find any users yet!']);
            });

        return users;
    }

    editChannel = async (channelId) => {

        var channelDoc = AraDTDatabase.storage.collection('channels').doc(channelId);
        var editChannel = {};
        await channelDoc.get()
            .then((datum) => {
                editChannel = this.getChannelData(datum);
            })
            .catch(() => {
                throw new Error(['This channel does not exist']);
            });
        var inUsers = [];
        var outUsers = [];
        await AraDTDatabase.firebaseAdmin.auth().listUsers()
            .then((data) => {
                data.users.forEach((datum) => {
                    if (!AraDTValidator.isEmptyObj(editChannel.users) 
                        && editChannel.users.includes(datum.uid)) {
                        inUsers.push({
                            id: datum.uid,
                            name: datum.displayName,
                            image: datum.photoURL,
                        });
                    } else {
                        outUsers.push({
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
            editChannel,
            inUsers,
            outUsers
        }
    }

    updateChannel = async (request, response) => {

        var channelId = request.params.channelId;
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
                throw Error(result);
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
                throw Error(result.result);
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
                } else {
                    channels.sort((a, b) => (a.users.length < b.users.length) ? 1 : -1);
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
                } else {
                    channels.sort((a, b) => (a.users.length < b.users.length) ? 1 : -1);
                }
            })
            .catch((error) => {
                console.log('Error fetching channel data:' + error.message);
            });
        return channels;
    }

    getChannels = async () => {

        var channels = [];
        await AraDTDatabase.storage.collection('channels')
            .orderBy('createdAt', 'desc')
            .get()
            .then((data) => {
                data.forEach((datum) => {
                    channels.push(this.getChannelData(datum));
                });
                if (channels.length == 0) {
                    channels = false;
                } else {
                    channels.sort((a, b) => (a.users.length < b.users.length) ? 1 : -1);
                }
            })
            .catch((error) => {
                console.log('Error fetching channel data:' + error.message);
            });
        return channels;
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
}
module.exports = ChannelModel;