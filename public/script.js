const socket = io('/');
const videoGrid = document.getElementById('video-grid')
const myVideo = document.createElement('video');
myVideo.muted = true;
var myvideoStream
var peer = new Peer()
peer.on("open",()=> {
    console.log("id",peer.id);

    navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
    }).then(stream => {
        socket.emit('join-room', ROOM_ID, peer.id)
        myvideoStream = stream;
        addVideoStream(myVideo, stream, "myCam");
        
        peer.on('call', call=>{
            call.answer(stream)
            const video = document.createElement('video')
            console.log(call);
            call.on('stream', userVideoStream=>{
                addVideoStream(video, userVideoStream, call.peer)
            })
        })

        socket.on('user-connected', (userId)=>{
            console.log("new user");
            connectToNewUser(userId, stream);
        })
        socket.on('user-disconnected', (userId)=>{
            const v = document.getElementById("id"+userId);
            if (v) {
                v.remove();
            }
        })
    })

})

const connectToNewUser = (userId, stream) => {
    const call = peer.call(userId, stream);
    const video = document.createElement('video');
    call.on('stream', userVideoStream=>{
        addVideoStream(video, userVideoStream, userId)
    })
}

const addVideoStream = (video, stream, userId) => {
    video.srcObject = stream;
    video.id = "id"+userId;
    video.addEventListener('loadedmetadata', ()=> {
        video.play();
    })
    videoGrid.append(video);
}

tv = ()=>{
    const enabled = myvideoStream.getVideoTracks()[0].enabled
    if (enabled) {
        myvideoStream.getVideoTracks()[0].enabled = false;
        document.getElementById("toggleVideo").textContent = "enable video";
    }else{
        myvideoStream.getVideoTracks()[0].enabled = true;
        document.getElementById("toggleVideo").textContent = "disable video";
    }
}
ta = ()=>{
    const enabled = myvideoStream.getAudioTracks()[0].enabled
    if (enabled) {
        myvideoStream.getAudioTracks()[0].enabled = false;
        document.getElementById("toggleAudio").textContent = "unmute";
    }else{
        myvideoStream.getAudioTracks()[0].enabled = true;
        document.getElementById("toggleAudio").textContent = "mute";
    }
}