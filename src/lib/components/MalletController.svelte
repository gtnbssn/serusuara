<script lang="ts" context="module">
  import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";

  const vision = await FilesetResolver.forVisionTasks("/wasm");

  const createHandLandmarker = async (): Promise<HandLandmarker> => {
    const landmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: `/hand_landmarker.task`,
        delegate: "GPU",
      },
      runningMode: "VIDEO",
      numHands: 2,
    });
    return landmarker;
  };

  const handLandmarker = await createHandLandmarker();

  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      width: { ideal: 2160 },
      height: { ideal: 4096 },
    },
  });

  let video = document.createElement("video");

  video.srcObject = stream;
  video.autoplay = true;
  video.playsInline = true;
  const settings = stream.getVideoTracks()[0].getSettings();
  video.height = settings.height as number;
  video.width = settings.width as number;

  video.style.position = "absolute";
  video.style.top = "0";
  video.style.opacity = "0.2";
  video.style.transform = "scaleX(-1)";
  video.style.width = "100%";
  video.style.height = "100%";
  video.style.pointerEvents = "none";

  let videoHasLoaded = false;
  video.addEventListener("loadeddata", () => {
    videoHasLoaded = true;
  });
  document.body.insertBefore(video, null);

  let lastVideoTime = -1;
</script>

<script lang="ts">
  import { T, useThrelte } from "@threlte/core";
  import { Vector3 } from "three";
  import { AutoColliders, RigidBody } from "@threlte/rapier";
  import { Tween } from "svelte/motion";
  import { expoIn } from "svelte/easing";
  import { rightWristPosition } from "$lib/stores";
  import { totalForceMagnitude } from "$lib/stores";

  let malletBody: RigidBody;
  let handBody: RigidBody;
  let handPosition = new Vector3();

  let attached = false;
  const defaultAttachmentThreshold = 0.8;
  const attachmentThreshold = new Tween(defaultAttachmentThreshold, {
    delay: 500,
    duration: 500,
    easing: expoIn,
  });

  const predictHands = async () => {
    // Now let's start detecting the stream.
    let results;
    let startTimeMs = performance.now();
    if (lastVideoTime !== video.currentTime) {
      lastVideoTime = video.currentTime;
      results = handLandmarker.detectForVideo(video, startTimeMs);
    }
    if (results?.landmarks) {
      let rightHandIndex: number = -1;
      results.handedness.forEach((hand, index) => {
        if (hand[0].categoryName == "Right") rightHandIndex = index;
      });
      if (rightHandIndex != -1) {
        $rightWristPosition = results.landmarks[rightHandIndex]?.[0];
      }
      for (const landmarks of results.landmarks) {
        landmarks.forEach((landmark) => {
          landmark.x = 1 - landmark.x;
        });
      }
    }
  };

  const { size } = useThrelte();
  let aspectRatio = $size.width / $size.height;

  const videoFrameCallback = () => {
    if (videoHasLoaded) predictHands();
    handBody?.setTranslation(
      {
        x: (rightWristPosition.current.x - 0.5) * 20 * aspectRatio,
        y: (rightWristPosition.current.y - 0.5) * -20,
        z: 0,
      },
      true,
    );
    if (attached) {
      const xdiff = handBody.translation().x - malletBody.translation().x;
      const ydiff = handBody.translation().y - malletBody.translation().y;
      const vectorDiff = new Vector3(xdiff * 15, ydiff * 15, 0);
      malletBody.setLinvel(vectorDiff, true);
    } else if (
      Math.sqrt(
        (handBody.translation().x - malletBody.translation().x) ** 2 +
          (handBody.translation().y - malletBody.translation().y) ** 2,
      ) < attachmentThreshold.current
    ) {
      attached = true;
      attachmentThreshold.set(0, { delay: 0, duration: 0 });
    }
    video.requestVideoFrameCallback(videoFrameCallback);
  };
  video.requestVideoFrameCallback(videoFrameCallback);
</script>

<RigidBody bind:rigidBody={handBody}>
  <T.Mesh position={[handPosition.x, handPosition.y, handPosition.z]}>
    <T.PlaneGeometry />
    <T.MeshStandardMaterial />
  </T.Mesh>
  <T.PointLight
    position={[handPosition.x, handPosition.y, handPosition.z]}
    args={[0xff0000, 1000, 0]}
  ></T.PointLight>
</RigidBody>

<RigidBody
  bind:rigidBody={malletBody}
  angularDamping={1}
  enabledTranslations={[true, true, false]}
  oncollisionenter={() => {
    attached = false;
    attachmentThreshold.set(defaultAttachmentThreshold);
  }}
>
  <AutoColliders
    shape="ball"
    mass={200}
    oncontact={(e) => {
      $totalForceMagnitude = e.totalForceMagnitude;
    }}
  >
    <T.Mesh position={[0, 0, 0]}>
      <T.IcosahedronGeometry args={[0.7, 2]} />
      <T.MeshStandardMaterial color="#F811CE" />
    </T.Mesh>
  </AutoColliders>
</RigidBody>
