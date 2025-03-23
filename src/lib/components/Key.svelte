<script lang="ts">
  import { T } from "@threlte/core";
  import { Audio } from "@threlte/extras";
  import { AutoColliders, RigidBody } from "@threlte/rapier";
  import { velocityMonitor } from "$lib/stores";

  export let position = [0, 0, 0];
  export let pitch: 1 | 2 | 3 | 4 | 5 | 6 | 7;

  let stop: () => Audio;
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
        stop();
      }}
      oncontact={(e) => {
        F = Math.abs(e.totalForce.y);
      }}
      oncollisionexit={() => {
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
