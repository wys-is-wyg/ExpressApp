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
        this.setVariables();
        AraDTApp.get('/channels', this.fetchChannels);
        AraDTApp.post('/channels/add', this.addChannel);
        AraDTApp.post('/channels/delete/:channelId', this.deleteChannel);
        AraDTApp.get('/channel/:channelId', this.showChannel);
        AraDTApp.get('/channels/edit/:channelId', this.editChannel);
        AraDTApp.post('/channels/edit/:channelId', this.updateChannel);
    }
    
    /**
     * 
     */
    setVariables(){
        AraDTApp.use(async function(request, response, next) {
            response.locals.channels = {};
            if (!response.locals.errors){
                response.locals.errors = {};
            }
            if (!request.session.errors.channels){
                request.session.errors.channels = {};
            }
            if (!response.locals.errors.channels){
                response.locals.errors.channels = {};
            }
            next();
        });
    }

    showChannel = async (request, response, next) => {
        next();
    }

    fetchChannels = async (request, response, next) => {
        
        if (!request.session.token) {
           response.redirect('/');
        }
        try{
            await this.fetchChannelData(request, response, next);
        } catch(errors) {
            response.locals.errors.channels.general = errors;
        }
        response.render('channels');
    };

    addChannel = async (request, response, next) => {
        
        if (!request.session.token) {
            response.redirect('/');
        }
        if (AraDTValidator.isEmpty(request.body.name)) {
            request.session.errors.channels.general = ['You need to add a channel name'];
            response.redirect('/channels');
        }
        try{
            await AraDTChannelModel.addChannel(request, response)
                .then(() => {
                    request.session.errors.channels.general = ['Your channel has been created'];
                    response.redirect('/channels');
                })
                .catch((error) => {
                    request.session.errors.channels.general = [error.message];
                    response.redirect('/channels');
                });
        } catch(errors) {
            response.locals.errors.channels.general = errors;
        }
    };

    editChannel = async (request, response, next) => {
        
        if (!request.session.token) {
            response.redirect('/');
        }
        var channelId = request.params.channelId;
        
        if (!channelId) {
            request.session.errors.channels.general = ['You need to specify a channel to edit'];
            response.redirect('/channels');
        }
        try{
            await this.fetchChannelData(request, response, next);
        } catch(errors) {
            response.locals.errors.channels = errors;
        }
        response.render('channel-edit');
    };

    updateChannel = async (request, response, next) => {

        if (!request.session.token) {
            response.redirect('/');
        }

        var channelId = request.params.channelId;
        var errors = response.locals.errors.channels;
        
        if (!channelId) {
            errors.general = ['You need to specify a channel to edit'];
            response.redirect('/channels');
        }

        if (AraDTValidator.isEmpty(request.body.name)) {
            errors.edit = ['You need to specify a name'];
        }

        try{
            await AraDTChannelModel.updateChannel(request, response)
                .then(()=>{
                    errors.edit = ['Your channel has been updated'];
                })
                .catch((error) => {
                    errors.edit = [error];
                });
        } catch(errors) {
            errors.edit = errors;
        }
        try{
            await this.fetchChannelData(request, response, next);
        } catch(errors) {
            response.locals.errors.channels = errors;
        }
        response.render('channel-edit');
    };

    deleteChannel = async (request, response, next) => {
        
        if (!request.session.token) {
            response.redirect('/');
        }
        
        if (!channelId) {
            errors.general = ['You need to specify a channel to delete'];
            response.redirect('/channels');
        }
    }

    fetchChannelData = async (request, response, next) => {
        try{
            var subscribed = await AraDTChannelModel.getSubscribedChannels();
            var owned = await AraDTChannelModel.getOwnedChannels();
            response.locals.channels.owned = owned;
            response.locals.channels.subscribed = subscribed;
            var channelId = request.params.channelId;
            if (channelId) {
                var editChannel = await AraDTChannelModel.editChannel(channelId);
                response.locals.channels.editChannel = editChannel.editChannel;
                response.locals.channels.inUsers = editChannel.inUsers;
                response.locals.channels.outUsers = editChannel.outUsers;
            }
            return;
        } catch(error) {
            throw Error(error);
        }
    }

}
module.exports = ChannelController;