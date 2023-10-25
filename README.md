# Vision3D
This is an attempt to give 3D effect to elements in a laptop screen, without 3D glasses.
Inital inspiration is from the Mission: Impossible - Ghost Protocol hallway projection scene.  

[![Video](https://img.youtube.com/vi/7DkV8WE7DFA/hqdefault.jpg)](https://www.youtube.com/watch?v=7DkV8WE7DFA)  

In summary, the perspective of elements in a webpage is changed based on the position a viewer is looking at, using the webcam.

## Demo
Checkout a demo in with github pages : [==See Demo==](https://eranda-ihalagedara.github.io/vision3d/index.html)==  
**Note that you would have to grant permission to use webcam**

## Eye Tracking : [MediaPipe](https://developers.google.com/mediapipe)
To deteremine the where the viewer, eyes are tracked usinge [MediaPipe Face Landmarker](https://developers.google.com/mediapipe/solutions/vision/face_landmarker#get_started).
It detects 478 face landmarks in both images and videos. The model is small in size and the detection is quite fast even with generic computing power(CPU/GPU) of a laptop. On top of that it comes with a JavaScript API which makes it ideal for web applications.

## CSS 3D
The 3D cube is created using CSS. See the 3D cube in this [repo](https://github.com/eranda-ihalagedara/web-development-mini-projects/tree/main/CSS%203D)

## References & Credits
- [MediaPipe](https://developers.google.com/mediapipe) : Credit goes to the MediaPipe Authors and creators of face/landmark detection models MediaPipe is based on.
