
class Channel{

    constructor(channel = false){
        this.channel = channel;
        this.getChannel();
    }

    isLoggedIn(){
        this.getChannel();
        return (typeof this.channel  === 'object');
    }
    
    getChannel(request){
        this.channel = request.session.channel;
        return this.channel;
    }
    
    getChannelId(){
        if (this.isLoggedIn()) {
            return this.channel.localId;
        }
        return false;
    }
    
    getChannelIdToken(){
        if (this.isLoggedIn()) {
            return this.channel.idToken;
        }
        return false;
    }

    setChannel(request, channel){
        request.session.channel = channel;
        this.getChannel();
    }

    unsetChannel(request){
        this.channel = false;
        request.session.channel = false;
    }
}
module.exports = Channel;