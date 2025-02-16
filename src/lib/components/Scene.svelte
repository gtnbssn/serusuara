<script lang="ts">
  import { T, useTask, useThrelte } from "@threlte/core";
  import {
    AudioListener,
    ContactShadows,
    Float,
    Grid,
    OrbitControls,
  } from "@threlte/extras";
  import {
    AutoColliders,
    Collider,
    CollisionGroups,
    RigidBody,
  } from "@threlte/rapier";
  import MalletController from "./MalletController.svelte";
  import Key from "./Key.svelte";
</script>

<T.PerspectiveCamera makeDefault position={[0, 0, 50]} fov={15}>
  <OrbitControls
    enableZoom={true}
    enableDamping
    autoRotateSpeed={0.5}
    target.y={0}
  />
  <AudioListener />
</T.PerspectiveCamera>

<T.DirectionalLight intensity={0.8} position.x={5} position.y={10} />
<T.AmbientLight intensity={0.2} />

<Grid
  cellColor="#ffffff"
  sectionColor="#88ff88"
  sectionThickness={2}
  sectionSize={5}
  fadeDistance={200}
  cellSize={1}
  plane="xy"
/>

<ContactShadows scale={10} blur={2} far={2.5} opacity={0.5} />

<CollisionGroups groups={[0]}>
  <T.Group position={[-10, 0, 0]}>
    <Collider shape="cuboid" args={[1, 10, 10]} restitution={1} />
  </T.Group>
  <T.Group position={[+10, 0, 0]}>
    <Collider shape="cuboid" args={[1, 10, 10]} restitution={1} />
  </T.Group>
  <T.Group rotation={[Math.PI / 2, Math.PI / 2, 0]} position={[0, 7, 0]}>
    <Collider shape="cuboid" args={[1, 10, 10]} restitution={1} />
  </T.Group>
  <T.Group rotation={[Math.PI / 2, Math.PI / 2, 0]} position={[0, -4, 0]}>
    <Collider shape="cuboid" args={[1, 10, 10]} restitution={1} />
  </T.Group>

  <T.DirectionalLight />

  <Key position={[-6, -3, 0]} pitch={1} />
  <Key position={[-4, -3, 0]} pitch={2} />
  <Key position={[-2, -3, 0]} pitch={3} />
  <Key position={[0, -3, 0]} pitch={4} />
  <Key position={[2, -3, 0]} pitch={5} />
  <Key position={[4, -3, 0]} pitch={6} />
  <Key position={[6, -3, 0]} pitch={7} />

  <!-- <RigidBody enabledTranslations={[true, true, false]}> -->
  <!-- 	<AutoColliders shape="ball"> -->
  <!-- 		<T.Mesh position={[-1.4, 1.5, 0.75]} rotation={[-5, 128, 10]}> -->
  <!-- 			<T.IcosahedronGeometry /> -->
  <!-- 			<T.MeshStandardMaterial color="#F8EBCE" /> -->
  <!-- 		</T.Mesh> -->
  <!-- 	</AutoColliders> -->
  <!-- </RigidBody> -->

  <MalletController />

  <!-- <RigidBody userData={{ gravityGroup: 1 }} bind:rigidBody={springRoot}> -->
  <!-- 	<!-- <AutoColliders shape="cuboid" mass={200}> --> -->
  <!-- 	<!-- <T.Mesh position={[0, 0, 0]}> --> -->
  <!-- 	<!-- 	<T.BoxGeometry /> --> -->
  <!-- 	<!-- 	<T.MeshStandardMaterial color="#F8EBCE" /> --> -->
  <!-- 	<!-- </T.Mesh> --> -->
  <!-- 	<!-- </AutoColliders> --> -->
  <!-- </RigidBody> -->
  <!---->
  <!-- <RigidBody userData={{ gravityGroup: 1 }} bind:rigidBody={mallet}> -->
  <!-- 	<AutoColliders shape="ball" mass={200}> -->
  <!-- 		<T.Mesh position={[0, 0, 0]}> -->
  <!-- 			<T.IcosahedronGeometry /> -->
  <!-- 			<T.MeshStandardMaterial color="#F811CE" /> -->
  <!-- 		</T.Mesh> -->
  <!-- 	</AutoColliders> -->
  <!-- </RigidBody> -->
</CollisionGroups>
