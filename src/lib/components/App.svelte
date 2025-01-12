<script lang="ts">
  import { Canvas } from "@threlte/core";
  import { PerfMonitor } from "@threlte/extras";
  import { World, Debug } from "@threlte/rapier";
  import { Button, Monitor, Pane } from "svelte-tweakpane-ui";
  import Scene from "./Scene.svelte";
  import MpCanvas from "./mediapipe/MPCanvas.svelte";
  import { velocityMonitor, totalForceMagnitude } from "$lib/stores";
</script>

<Canvas>
  <MpCanvas />
  <World gravity={[0, 0, 0]}>
    <Debug />
    <Scene />
  </World>
  <!-- <PerfMonitor logsPerSecond={10} /> -->
  <!--<Pane position="fixed" scale={2} width={512}>
    <Monitor
      value={$totalForceMagnitude}
      label="total force magnitude"
      graph={true}
      interval={1000}
      max={1000000}
    />
    <Monitor value={$velocityMonitor} label="velocity" />
  </Pane>-->
</Canvas>
