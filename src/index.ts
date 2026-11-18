import { World, OneHandGrabbable } from '@iwsdk/core';
import { PlaneGeometry, SphereGeometry, Mesh, MeshStandardMaterial } from 'three';
import { TearablePaper, TearHandle } from './components.js';
import { PaperTearSystem } from './systems/PaperTearSystem.js';

const container = document.getElementById('scene-container') as HTMLDivElement;

World.create(container, {
  features: { grabbing: true },
}).then((world) => {
  const paperMat = new MeshStandardMaterial({
    color: 0xfdfbf7,
    side: 2,
    roughness: 0.85,
    vertexColors: true,
  });

  const paperMesh = new Mesh(
    new PlaneGeometry(0.4, 0.3, 20, 24),
    paperMat
  );
  const paperEntity = world.createTransformEntity(paperMesh);
  paperEntity.object3D!.position.set(0, 1.2, -0.6);
  paperEntity.addComponent(TearablePaper, { tearThreshold: 0.55 });

  const handleGeo = new SphereGeometry(0.03);
  const handleMat = new MeshStandardMaterial({ color: 0xff5555, transparent: true, opacity: 0.5 });

  const leftEntity = world.createTransformEntity(new Mesh(handleGeo, handleMat));
  leftEntity.object3D!.position.set(-0.18, 1.32, -0.6);
  leftEntity.addComponent(OneHandGrabbable, { translate: true, rotate: true });
  leftEntity.addComponent(TearHandle, { side: 0 });

  const rightEntity = world.createTransformEntity(new Mesh(handleGeo, handleMat));
  rightEntity.object3D!.position.set(0.18, 1.32, -0.6);
  rightEntity.addComponent(OneHandGrabbable, { translate: true, rotate: true });
  rightEntity.addComponent(TearHandle, { side: 1 });

  world.registerSystem(PaperTearSystem);
});
