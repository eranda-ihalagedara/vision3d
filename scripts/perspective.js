import vision from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3";

const { FaceLandmarker, FilesetResolver, DrawingUtils } = vision;
const demosSection = document.getElementById("demos");
const imageBlendShapes = document.getElementById("image-blend-shapes");
const videoBlendShapes = document.getElementById("video-blend-shapes");
let faceLandmarker;
let runningMode = "IMAGE";
let enableWebcamButton;
let webcamRunning = false;
const videoWidth = 240;

// Before we can use HandLandmarker class we must wait for it to finish
// loading. Machine Learning models can be large and take a moment to
// get everything needed to run.
async function createFaceLandmarker() {
    const filesetResolver = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm");
    faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
            delegate: "GPU"
        },
        outputFaceBlendshapes: true,
        runningMode,
        numFaces: 1
    });
    demosSection.classList.remove("invisible");
}

createFaceLandmarker();

const video = document.getElementById("webcam");
const canvasElement = document.getElementById("output_canvas");
const canvasCtx = canvasElement.getContext("2d");
// Check if webcam access is supported.
function hasGetUserMedia() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}
// If webcam supported, add event listener to button for when user
// wants to activate it.
if (hasGetUserMedia()) {
    enableWebcamButton = document.getElementById("webcamButton");
    enableWebcamButton.addEventListener("click", enableCam);
}
else {
    console.warn("getUserMedia() is not supported by your browser");
}

// Enable the live webcam view and start detection.
function enableCam(event) {
    if (!faceLandmarker) {
        console.log("Wait! faceLandmarker not loaded yet.");
        return;
    }
    if (webcamRunning === true) {
        webcamRunning = false;

        if(video.srcObject != null){ 
            video.srcObject.getTracks().forEach(track => {
                track.stop();
            });
        }

        video.removeEventListener("loadeddata", predictWebcam);

        canvasElement.style.opacity = `0%`;
        video.style.opacity = `0%`;

        enableWebcamButton.innerText = "ENABLE WEBCAM";
    }
    else {
        webcamRunning = true;
        enableWebcamButton.innerText = "DISABLE WEBCAM";
    
        // getUsermedia parameters.
        const constraints = {
            video: true
        };
        // Activate the webcam stream.
        navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
            video.srcObject = stream;
            video.addEventListener("loadeddata", predictWebcam);
        });
        
        video.style.opacity = `100%`;
        canvasElement.style.opacity = `100%`;
        
    }
}

let lastVideoTime = -1;
let results = undefined;
const drawingUtils = new DrawingUtils(canvasCtx);
let frameTime = performance.now();
// const fpsDisplay = document.getElementById("fps");
// const eyeCordDisplay = document.getElementById("eye_cord");
const fpsList = [];
const nMovingAvg = 20;

const viewpoint = document.getElementById("viewpoint");
const canvas = document.getElementById("canvas");
const persFactX = 1/8;
const persFactY = 1/4;

async function predictWebcam() {
    const radio = video.videoHeight / video.videoWidth;
    video.style.width = videoWidth + "px";
    video.style.height = videoWidth * radio + "px";
    canvasElement.style.width = videoWidth + "px";
    canvasElement.style.height = videoWidth * radio + "px";
    canvasElement.width = video.videoWidth;
    canvasElement.height = video.videoHeight;
    // Now let's start detecting the stream.
    if (runningMode === "IMAGE") {
        runningMode = "VIDEO";
        await faceLandmarker.setOptions({ runningMode: runningMode });
    }
    let startTimeMs = performance.now();
    if (lastVideoTime !== video.currentTime) {
        lastVideoTime = video.currentTime;
        results = faceLandmarker.detectForVideo(video, startTimeMs);
    }
    if (results.faceLandmarks) {
        for (const landmarks of results.faceLandmarks) {
            drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS, { color: "#FF3030" });
            drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS, { color: "#30FF30" });

            const midX = Math.round(100*(video.videoWidth/2 - video.videoWidth*(landmarks[468].x + landmarks[473].x)/2))/100;
            const midY = Math.round(100*(video.videoHeight*(landmarks[468].y + landmarks[473].y)/2 - video.videoHeight/2))/100;

            viewpoint.style.perspectiveOrigin = `${50+ midX * persFactX}% ${50 + midY * persFactY}%`;
            canvas.style.perspectiveOrigin = `${50+ midX * persFactX}% ${50 + midY * persFactY}%`;
            
            // eyeCordDisplay.innerHTML = "X : " +midX + "<br>Y : "+ midY;
        }
    }
    //Show FPS =================
    
    // const nowFrameTime = performance.now();
    // fpsList.push(Math.round(100000/(nowFrameTime-frameTime))/100);
    
    // if(fpsList.length>nMovingAvg){
    //     fpsList.shift();
    // }

    // fpsDisplay.innerHTML = fpsList.reduce((a,b)=>a+b,0)/fpsList.length;
    // frameTime = nowFrameTime;
    //===============
    
    // drawBlendShapes(videoBlendShapes, results.faceBlendshapes);
    // Call this function again to keep predicting when the browser is ready.
    if (webcamRunning === true) {
        window.requestAnimationFrame(predictWebcam);
    }
}


// ------------------------------------------------------------

// Get the element with id "output"
const nDots = 1000;
const spreadX = 5000;
const spreadY = 2000;

for(let dotId=0; dotId < nDots; dotId++){
    const dot = document.createElement("div");
    dot.classList.add("dot");
    canvas.insertBefore(dot, viewpoint);
    
    const x = Math.floor(Math.random() * spreadX)-spreadX/2;
    const y = Math.floor(Math.random() * spreadY)-spreadY/2;
    const z = Math.floor(Math.random() * 1000) + 1000;
    dot.style.transform = "translate3d("+x+"px,"+y+"px, -"+z+"px)";
    
    
}