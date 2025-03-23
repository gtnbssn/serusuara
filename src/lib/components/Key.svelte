<script lang="ts">
  import { T, useThrelteUserContext } from "@threlte/core";
  import { Audio } from "@threlte/extras";
  import {
    AutoColliders,
    Collider,
    RigidBody,
    useJoint,
  } from "@threlte/rapier";
  import { velocityMonitor } from "$lib/stores";

  export let position = [0, 0, 0];
  export let pitch: 1 | 2 | 3 | 4 | 5 | 6 | 7;

  let playSoftest: (delay?: number) => Promise<Audio>;
  let playSoft: (delay?: number) => Promise<Audio>;
  let playMedium: (delay?: number) => Promise<Audio>;
  let playHarder: (delay?: number) => Promise<Audio>;
  let playHardest: (delay?: number) => Promise<Audio>;
  let stop: () => Audio;
  let velocity: "softest" | "soft" | "medium" | "harder" | "hardest";
  let softestAudioComponent;
  let softAudioCompomnent;
  let mediumAudioComponent;
  let harderAudioComponent;
  let hardestAudioComponent;
  let F: number;
</script>

<T.Group {position}>
  <RigidBody />
  <RigidBody
    enabledTranslations={[false, false, false]}
    enabledRotations={[false, false, false]}
  >
    <AutoColliders
      restitution={1}
      shape="cuboid"
      oncollisionenter={() => {
        console.log("collisionEnter");
        stop();
      }}
      oncontact={(e) => {
        console.log(e.totalForce.y);
        F = Math.abs(e.totalForce.y);
      }}
      oncollisionexit={() => {
        console.log("collisionExit");
        if (F > 800000) {
          hardestAudioComponent.play();
          $velocityMonitor = "hardest";
        } else if (F > 650000) {
          harderAudioComponent.play();
          $velocityMonitor = "harder";
        } else if (F > 400000) {
          mediumAudioComponent.play();
          $velocityMonitor = "medium";
        } else if (F > 100000) {
          softAudioCompomnent.play();
          $velocityMonitor = "soft";
        } else {
          softestAudioComponent.play();
          $velocityMonitor = "softest";
        }
      }}
    >
      <T.Mesh scale={[1, 0.1, 3]}>
        <T.BoxGeometry />
        <T.MeshStandardMaterial color="#efaf0d" roughness={0.5} metalness={1} />
      </T.Mesh>
    </AutoColliders>
  </RigidBody>
</T.Group>

<Audio
  src={`/sounds/saron-${pitch}-softest.wav`}
  bind:this={softestAudioComponent}
/>
<Audio
  src={`/sounds/saron-${pitch}-soft.wav`}
  bind:this={softAudioCompomnent}
/>
<Audio
  src={`/sounds/saron-${pitch}-medium.wav`}
  bind:this={mediumAudioComponent}
/>
<Audio
  src={`/sounds/saron-${pitch}-harder.wav`}
  bind:this={harderAudioComponent}
/>
<Audio
  src={`/sounds/saron-${pitch}-hardest.wav`}
  bind:this={hardestAudioComponent}
/>
