import { createSystem, Transform, OneHandGrabbable } from '@iwsdk/core';
import { Vector3, Mesh, BufferAttribute, BufferGeometry, MeshStandardMaterial, DoubleSide } from 'three';
import { TearablePaper, TearHandle } from '../components.js';
import { ProceduralRipAudio } from '../audio/ProceduralRipAudio.js';

const posA = new Vector3();
const posB = new Vector3();
const prevA = new Vector3();
const prevB = new Vector3();

export class PaperTearSystem extends createSystem({
  papers: { required: [TearablePaper, Transform] },
  handles: { required: [TearHandle, Transform, OneHandGrabbable] },
}) {
  private ripAudio = new ProceduralRipAudio();
  private tearProgress = 0;
  private basePositions: Float32Array | null = null;
  private jaggedOffsets: Float32Array | null = null;
  private readonly cols = 20;
  private readonly rows = 24;

  update(dt: number) {
    const handles = Array.from(this.queries.handles.entities);
    if (handles.length < 2) return;

    const leftHandle = handles.find((e) => e.getValue(TearHandle, 'side') === 0);
    const rightHandle = handles.find((e) => e.getValue(TearHandle, 'side') === 1);
    if (!leftHandle || !rightHandle) return;

    leftHandle.object3D!.getWorldPosition(posA);
    rightHandle.object3D!.getWorldPosition(posB);

    const speedA = prevA.lengthSq() > 0 ? posA.distanceTo(prevA) / Math.max(dt, 0.001) : 0;
    const speedB = prevB.lengthSq() > 0 ? posB.distanceTo(prevB) / Math.max(dt, 0.001) : 0;
    const pullVelocity = Math.max(speedA, speedB);
    prevA.copy(posA);
    prevB.copy(posB);

    const horizontalGap = posA.distanceTo(posB);
    const verticalShear = Math.abs(posA.y - posB.y);
    const peelForce = horizontalGap * 0.7 + verticalShear * 1.3;

    for (const paperEntity of this.queries.papers.entities) {
      if (paperEntity.getValue(TearablePaper, 'isTorn')) continue;

      const mesh = paperEntity.object3D as Mesh;
      const geo = mesh.geometry as BufferGeometry;
      const posAttr = geo.attributes.position as BufferAttribute;

      if (!this.basePositions) {
        this.basePositions = new Float32Array(posAttr.array);
        this.jaggedOffsets = new Float32Array(this.rows + 1);
        for (let r = 0; r <= this.rows; r++) {
          this.jaggedOffsets[r] = (Math.random() - 0.5) * 0.018;
        }
      }

      const threshold = paperEntity.getValue(TearablePaper, 'tearThreshold');
      const targetProgress = Math.min(Math.max((peelForce - 0.32) / threshold, 0), 1);

      if (targetProgress > this.tearProgress) {
        const deltaRip = targetProgress - this.tearProgress;
        this.tearProgress = targetProgress;
        this.ripAudio.updateRip(pullVelocity, deltaRip);
        this.rebuildSplitGeometry(geo, posAttr, this.tearProgress);
      } else {
        this.ripAudio.silence();
      }

      if (this.tearProgress >= 0.99) {
        paperEntity.setValue(TearablePaper, 'isTorn', true);
        this.ripAudio.playFinalSnap();
        this.detachHalves(paperEntity, leftHandle, rightHandle);
      }
    }
  }

  private rebuildSplitGeometry(geo: BufferGeometry, posAttr: BufferAttribute, progress: number) {
    if (!this.basePositions || !this.jaggedOffsets) return;

    const splitRowLimit = Math.floor(progress * this.rows);
    const centerCol = Math.floor(this.cols / 2);

    for (let r = 0; r <= this.rows; r++) {
      const isRowTorn = r <= splitRowLimit;
      const rowCurl = isRowTorn ? (1 - r / Math.max(splitRowLimit, 1)) * 0.08 : 0;

      for (let c = 0; c <= this.cols; c++) {
        const idx = (r * (this.cols + 1) + c) * 3;
        const bx = this.basePositions[idx];
        const by = this.basePositions[idx + 1];
        const bz = this.basePositions[idx + 2];

        const isLeftHalf = c <= centerCol;
        const seamShift = c === centerCol ? this.jaggedOffsets[r] : 0;

        if (isRowTorn) {
          const sideSign = isLeftHalf ? -1 : 1;
          posAttr.setXYZ(
            r * (this.cols + 1) + c,
            bx + seamShift + sideSign * rowCurl * 0.6,
            by - rowCurl * 0.25,
            bz + rowCurl
          );
        } else {
          const tensionPull = progress * 0.015 * (isLeftHalf ? -1 : 1);
          posAttr.setXYZ(r * (this.cols + 1) + c, bx + tensionPull, by, bz);
        }
      }
    }
    posAttr.needsUpdate = true;

    const newIndices: number[] = [];
    for (let r = 0; r < this.rows; r++) {
      const rowIsSevered = r < splitRowLimit;
      for (let c = 0; c < this.cols; c++) {
        if (rowIsSevered && c === centerCol) continue;
        const a = r * (this.cols + 1) + c;
        const b = a + 1;
        const d = (r + 1) * (this.cols + 1) + c;
        const e = d + 1;
        newIndices.push(a, d, b);
        newIndices.push(b, d, e);
      }
    }

    geo.setIndex(newIndices);
    geo.computeVertexNormals();
  }

  private detachHalves(paperEntity: any, leftHandle: any, rightHandle: any) {
    const intactMesh = paperEntity.object3D as Mesh;
    intactMesh.visible = false;

    const halfGeo = intactMesh.geometry.clone();
    const mat = new MeshStandardMaterial({ color: 0xfdfbf7, side: DoubleSide, roughness: 0.85 });

    const leftPiece = new Mesh(halfGeo, mat);
    leftPiece.position.set(-0.08, -0.12, 0);
    leftHandle.object3D!.add(leftPiece);

    const rightPiece = new Mesh(halfGeo, mat);
    rightPiece.position.set(0.08, -0.12, 0);
    rightHandle.object3D!.add(rightPiece);
  }
}
