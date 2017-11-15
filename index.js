// Horribly coded mashup of https://github.com/positlabs/temporalis and https://github.com/cwilso/volume-meter (but it works :-/)

var $ = function(selector){return document.querySelector(selector)}

var ss = new SlitScan(), 
	gifStatus = $('#gif-status'),
	gifInterval,
	signedIn

navigator.mediaDevices.enumerateDevices().then(function(info) {
	var videoInputs = info.filter(function(device){ return device.kind === 'videoinput' })
	var labels = videoInputs.map(function(device){ return device.label })
	if(videoInputs.length > 1){
		// gui.add(ss, 'camera', labels)
	}
	// setTimeout(function(){
		ss.camera = labels[0]
	// }, 5000)
})


//**************** VOLUME CODE
var audioContext = null;
var meter = null;
var canvasContext = null;
var WIDTH=500;
var HEIGHT=50;
var rafID = null;

window.onload = function() {
	
    // monkeypatch Web Audio
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
	
    // grab an audio context
    audioContext = new AudioContext();

    // Attempt to get audio input
    try {
        // monkeypatch getUserMedia
        navigator.getUserMedia = 
        	navigator.getUserMedia ||
        	navigator.webkitGetUserMedia ||
        	navigator.mozGetUserMedia;

        // ask for an audio input
        navigator.getUserMedia(
        {
            "audio": {
                "mandatory": {
                    "googEchoCancellation": "false",
                    "googAutoGainControl": "false",
                    "googNoiseSuppression": "false",
                    "googHighpassFilter": "false"
                },
                "optional": []
            },
        }, gotStream, didntGetStream);
    } catch (e) {
        alert('getUserMedia threw exception :' + e);
    }
}


function didntGetStream() {
    alert('Stream generation failed.');
}

function gotStream(stream) {
	var mediaStreamSource = null;
	// Create an AudioNode from the stream.
	mediaStreamSource = audioContext.createMediaStreamSource(stream);

	// Create a new volume meter and connect it.
	meter = createAudioMeter(audioContext);
	mediaStreamSource.connect(meter);

	let volumes = []
	let averageVolume = 2
	setInterval(() => {
		volumes.unshift(meter.volume)
		averageVolume = volumes.reduce((l, r) => l+r)/volumes.length
		console.log(volumes)
		if(volumes.length > 10) {
			volumes.pop()
		}
	}, 1000)
	
	const mult = 100
	setInterval(() => {
		ss.slices = Math.ceil(averageVolume*1000)+2
		console.log("slices: ", Math.ceil(averageVolume*1000)+2)
	}, 6000)
}
