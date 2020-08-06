/**
 * ChannelController Class.
 * 
 * Adds routing middleware for all channel functionality.
 *
 * @class ChannelController
 *
 */
class ChannelController{

    constructor(){
       // this.setVariables();
        AraDTApp.get('/channels', this.getUserChannels);
        AraDTApp.post('/channels/add', this.addChannel);
        AraDTApp.post('/channels/update/:channelId', this.updateChannel);
        AraDTApp.post('/channels/delete/:channelId', this.deleteChannel);
        AraDTApp.get('/channel/:channelId', this.showChannel);
        AraDTApp.get('/channels/edit/:channelId', this.editChannel);
    }
    
    /**
     * Assigns middleware to add Firebase.auth().currentUser to
     * UserModel, request.session, and response.locals variables
     */
    setVariables(){
        AraDTApp.use(async function(request, response, next) {
            // Chesk if user logged in for this session
            if (!request.session.token) {
                response.redirect('/');
            } else {
                next();
            }
        });
    }

    showChannel = async (request, response, next) => {
        next();
    }

    getUserChannels = async (request, response, next) => {
        
        if (!request.session.token) {
           response.redirect('/');
        }

        await AraDTChannelModel.getUserChannels()
            .then((data) => {
                response.locals.users = data.users;
                response.locals.ownedChannels = data.ownedChannels;
                response.locals.subscribedChannels = data.subscribedChannels;
                response.render('channels');
            })
            .catch(() => {
                request.session.errors.channel = ['We were unable to locate your channels'];
                response.render('channels');
            });
    };

    addChannel = async (request, response, next) => {
        
        if (!request.session.token) {
            response.redirect('/');
        }
        if (AraDTValidator.isEmpty(request.body.name)) {
            request.session.errors.general = ['You need to add a channel name'];
            response.redirect('/channels');
        }
    
        await AraDTChannelModel.addChannel(request, response)
            .then(() => {
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
            request.session.errors.general = ['You need to specifcy a channel to edit'];
            response.redirect('/channels');
        }
        var subscribedChannels = await AraDTChannelModel.getSubscribedChannels();
        var ownedChannels = await AraDTChannelModel.getOwnedChannels();
        var channel = await AraDTChannelModel.editChannel(channelId);
        response.locals.channelToEdit = channel.channelToEdit;
        response.locals.channelUsers = channel.channelUsers;
        response.locals.otherUsers = channel.otherUsers;
        response.locals.ownedChannels = ownedChannels;
        response.locals.subscribedChannels = subscribedChannels;
        response.render('channel-edit');
    };

    updateChannel = async (request, response, next) => {

        if (!request.session.token) {
            response.redirect('/');
        }
        var channelId = request.params.channelId;

        await AraDTChannelModel.updateChannel(request, response)
            .then(()=>{
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