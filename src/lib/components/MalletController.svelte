<script lang="ts" context="module">
	import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

	const vision = await FilesetResolver.forVisionTasks('/wasm');

	const createHandLandmarker = async (): Promise<HandLandmarker> => {
		const landmarker = await HandLandmarker.createFromOptions(vision, {
			baseOptions: {
				modelAssetPath: `/hand_landmarker.task`,
				delegate: 'GPU'
			},
			runningMode: 'VIDEO',
			numHands: 2
		});
		return landmarker;
	};

	const handLandmarker = await createHandLandmarker();

	const stream = await navigator.mediaDevices.getUserMedia({
		video: {
			width: { ideal: 2160 },
			height: { ideal: 4096 }
		}
	});

	let video = document.createElement('video');

	video.srcObject = stream;
	const settings = stream.getVideoTracks()[0].getSettings();
	video.height = settings.height;
	video.width = settings.width;
	console.log(video);

	let lastVideoTime = -1;
</script>

<script lang="ts">
	import { T, useStage, useTask, useThrelte } from '@threlte/core';
	import { BoxGeometry, MeshStandardMaterial, PlaneGeometry, Vector3 } from 'three';
	import { AutoColliders, RigidBody } from '@threlte/rapier';
	import { tweened } from 'svelte/motion';
	import { expoIn } from 'svelte/easing';
	import { rightWristPosition } from '$lib/stores';
	import { totalForceMagnitude } from '$lib/stores';

	let malletBody: RigidBody;
	let handBody: RigidBody;
	let handPosition: Vector3;

	let attached = false;
	const defaultAttachmentThreshold = 0.8;
	const attachmentThreshold = tweened(defaultAttachmentThreshold, {
		delay: 500,
		duration: 500,
		easing: expoIn
	});

	let videoHasLoaded = false;
	video.addEventListener('loadeddata', () => (videoHasLoaded = true));

	const predictHands = async () => {
		// Now let's start detecting the stream.
		let results;
		console.log(results);
		let startTimeMs = performance.now();
		if (lastVideoTime !== video.currentTime) {
			lastVideoTime = video.currentTime;
			results = handLandmarker.detectForVideo(video, startTimeMs);
		}
		if (results?.landmarks) {
			let rightHandIndex: number = -1;
			results.handedness.forEach((hand, index) => {
				if (hand[0].categoryName == 'Right') rightHandIndex = index;
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

	const { size, renderStage } = useThrelte();
	let aspectRatio = $size.width / $size.height;

	const beforeRenderStage = useStage('beforeRenderStage', { before: renderStage });

	const { task: setHandPosition } = useTask(
		'set-hand-position',
		() => {
			if (videoHasLoaded) predictHands();
			handBody?.setTranslation(
				{
					x: (rightWristPosition.current.x - 0.5) * 20 * aspectRatio,
					y: (rightWristPosition.current.y - 0.5) * -20,
					z: 0
				},
				true
			);
		},
		{ stage: beforeRenderStage }
	);
	const {} = useTask(
		() => {
			if (attached) {
				const xdiff = handBody.translation().x - malletBody.translation().x;
				const ydiff = handBody.translation().y - malletBody.translation().y;
				const vectorDiff = new Vector3(xdiff * 15, ydiff * 15, 0);
				malletBody.setLinvel(vectorDiff, true);
			} else if (
				Math.sqrt(
					(handBody.translation().x - malletBody.translation().x) ** 2 +
						(handBody.translation().y - malletBody.translation().y) ** 2
				) < $attachmentThreshold
			) {
				attached = true;
				attachmentThreshold.set(0, { delay: 0, duration: 0 });
			}
		},
		{ after: setHandPosition }
	);
</script>

<RigidBody bind:rigidBody={handBody}>
	<T.Mesh bind:position={handPosition}>
		<T.PlaneGeometry />
		<T.MeshStandardMaterial />
	</T.Mesh>
</RigidBody>

<RigidBody
	bind:rigidBody={malletBody}
	angularDamping={1}
	enabledTranslations={[true, true, false]}
	on:collisionenter={() => {
		attached = false;
		$attachmentThreshold = defaultAttachmentThreshold;
	}}
>
	<AutoColliders
		shape="ball"
		mass={200}
		on:contact={(e) => {
			// console.log(e);
			$totalForceMagnitude = e.totalForceMagnitude;
		}}
	>
		<T.Mesh position={[0, 0, 0]}>
			<T.IcosahedronGeometry />
			<T.MeshStandardMaterial color="#F811CE" />
		</T.Mesh>
	</AutoColliders>
</RigidBody>
