<script lang="ts" context="module">
  import {
    PoseLandmarker,
    FilesetResolver,
    HandLandmarker,
  } from "@mediapipe/tasks-vision";

  const vision = await FilesetResolver.forVisionTasks("/wasm");

  const createPoseLandmarker = async (): Promise<PoseLandmarker> => {
    const poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
      baseOptions: {
        // modelAssetPath: `/pose_landmarker_heavy.task`,
        modelAssetPath: `/pose_landmarker_lite.task`,
        delegate: "GPU",
      },
      runningMode: "VIDEO",
      numPoses: 1,
      outputSegmentationMasks: true,
    });
    return poseLandmarker;
  };

  const poseLandmarker = await createPoseLandmarker();

  const createHandLandmarker = async (): Promise<HandLandmarker> => {
    const landmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        // modelAssetPath: `/pose_landmarker_heavy.task`,
        modelAssetPath: `/hand_landmarker.task`,
        delegate: "GPU",
      },
      runningMode: "VIDEO",
      numHands: 2,
    });
    return landmarker;
  };

  const handLandmarker = await createHandLandmarker();
</script>

<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { rightWristPosition } from "$lib/stores";
  import { DrawingUtils } from "@mediapipe/tasks-vision";
  import { useParentSize } from "../../hooks/useParentSize";

  type Size = {
    width: number;
    height: number;
  };

  type CanvasContext = CanvasRenderingContext2D;

  // export let size: Size | undefined = undefined;

  let video: HTMLVideoElement;
  let canvas: HTMLCanvasElement;

  // const userSize = writable<Size | undefined>(size);
  // $: userSize.set(size);

  const { parentSize, parentSizeAction } = useParentSize();

  let ctx: CanvasContext;

  parentSize.subscribe(() => {
    if (ctx?.canvas) {
      ctx.canvas.height = $parentSize.height;
      ctx.canvas.width = $parentSize.width;
    }
  });

  onMount(() => {
    ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    ctx.canvas.height = $parentSize.height;
    ctx.canvas.width = $parentSize.width;
    const drawingUtils = new DrawingUtils(ctx);
    navigator.mediaDevices
      .getUserMedia({
        video: {
          width: { ideal: 2160 },
          height: { ideal: 4096 },
          // aspectRatio: 16 / 9
        },
      })
      .then((stream) => {
        video.srcObject = stream;
        video.addEventListener("loadeddata", predictHands);
        const settings = stream.getVideoTracks()[0].getSettings();
      });

    let lastVideoTime = -1;

    async function predictPose() {
      // Now let's start detecting the stream.
      let startTimeMs = performance.now();
      if (lastVideoTime !== video.currentTime) {
        lastVideoTime = video.currentTime;
        poseLandmarker.detectForVideo(video, startTimeMs, (result) => {
          if (result?.landmarks[0]) {
            result.landmarks[0].forEach(
              (landmark) => (landmark.x = 1 - landmark.x),
            );
            $rightWristPosition = result.landmarks[0][16];
          }
          // ctx.save();
          // ctx.clearRect(0, 0, canvas.width, canvas.height);
          // for (const landmark of result.landmarks) {
          // 	drawingUtils.drawLandmarks(landmark, {
          // 		radius: (data) => DrawingUtils.lerp(data.from!.z, -0.15, 0.1, 5, 1)
          // 	});
          // 	drawingUtils.drawConnectors(landmark, PoseLandmarker.POSE_CONNECTIONS);
          // }
          // ctx.restore();
        });
      }
      window.requestAnimationFrame(predictPose);
    }

    async function predictHands() {
      // Now let's start detecting the stream.
      let results;
      let startTimeMs = performance.now();
      if (lastVideoTime !== video.currentTime) {
        lastVideoTime = video.currentTime;
        results = handLandmarker.detectForVideo(video, startTimeMs);
      }
      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
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
          drawingUtils.drawConnectors(
            landmarks,
            HandLandmarker.HAND_CONNECTIONS,
            {
              color: "#0000FF",
              lineWidth: 1,
            },
          );
          drawingUtils.drawLandmarks(landmarks, {
            color: "#FF0000",
            lineWidth: 2,
          });
        }
      }
      ctx.restore();

      // Call this function again to keep predicting when the browser is ready.
      window.requestAnimationFrame(predictHands);
    }
  });
</script>

<video id="webcam" autoplay playsinline bind:this={video}
  ><track kind="captions" /></video
>
<canvas use:parentSizeAction bind:this={canvas}> </canvas>

<style>
  video {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    opacity: 1;
    transform: scaleX(-1);
    pointer-events: none;
  }
  canvas {
    position: absolute;
    top: 0;
    pointer-events: none;
  }
</style>
