/**
 * Next Stop, Little Shop — native motion starter v3 (2026-10-23).
 * Engine-neutral reference code, NOT an installed game update or finished rig.
 * Units: metres, radians, seconds; no Babylon, DOM, timers, storage or economics.
 *
 * Work integration contract:
 * 1. Capture before-snapshot, command ID/item/quantity/slot and presentation epoch
 *    BEFORE await. Copy command context so later UI selection cannot mutate it.
 * 2. Only AFTER Saves.command OR passive Saves.settle resolves successfully,
 *    projectConfirmedCommit(...), then observe(...), even when hidden/stale epoch.
 *    Promise rejection/CAS abort is not a confirmed commit. Loading, retry,
 *    import, mode switch and offline catch-up are BASELINES, never receipts.
 * 3. Keep one sequencer per active save stream (mode/shop/save incarnation).
 *    Seed its baseline from the authoritative loaded revision. On mode/shop or
 *    save-incarnation replacement, dispose it and create a new instance.
 *    Pass the CURRENT app-wide presentation epoch to every new instance; this
 *    is required explicitly, and must not reset to zero on mode switches.
 * 4. On hide, context loss, import/mode cancellation or stale presentation,
 *    invalidatePresentation(nextEpoch). Rebaseline after authoritative reload.
 *    Never erase receipt history just because animation was cancelled.
 * 5. UI authoritative state updates immediately; queued motion never owns money,
 *    stock, story progress, customer counts or success. A visual queue may drop
 *    an older pending vignette; the underlying result is already committed.
 * 6. Pose samples require a new rig/part adapter and calibration. Work still
 *    builds faces/clothes/materials, leg joints, foot contacts, navigation,
 *    collision avoidance, prop ownership, blending and actual visual evidence.
 */

export const COZY_TIMING = Object.freeze({
  maxFrameDeltaSeconds: 0.05,
  breathPeriodSeconds: 6,
  blinkPeriodSeconds: 5.8,
  blinkDurationSeconds: 0.26,
  strideMetres: 0.72, // One full left/right cycle; calibrate to the final rig.
  referenceWalkMetresPerSecond: 0.48,
  browseSeconds: Object.freeze([4, 8] as const),
  visitSeconds: Object.freeze([20, 40] as const),
  staffTaskIntervalSeconds: Object.freeze([12, 20] as const),
  saleSeconds: 2.8,
  stockSeconds: 2,
  displaySeconds: 0.65,
});

export interface MotionSettings {
  readonly quality: 'high' | 'low'; // Resolve Auto to its effective tier first.
  readonly minimalFx: boolean;
  readonly reduceMotion: boolean;
  readonly visible: boolean;
}
export interface MotionPolicy {
  readonly visible: boolean;
  readonly reduceMotion: boolean;
  readonly nativeMotion: boolean;
  readonly decorativeMotion: boolean;
  readonly customerCapacity: 1 | 2;
  readonly detailedIdle: boolean;
}

const TAU = Math.PI * 2;
function nonnegative(value: number, name: string): number {
  if (!Number.isFinite(value) || value < 0) throw new RangeError(name);
  return value;
}
function integer(value: number, name: string): number {
  if (!Number.isSafeInteger(value) || value < 0) throw new RangeError(name);
  return value;
}
function text(value: string, name: string): string {
  if (typeof value !== 'string' || value.length === 0) throw new TypeError(name);
  return value;
}
function fraction(value: number): number { return value - Math.floor(value); }

export function resolveMotionPolicy(settings: MotionSettings): MotionPolicy {
  if (settings.quality !== 'high' && settings.quality !== 'low') throw new TypeError('quality');
  for (const value of [settings.visible, settings.minimalFx, settings.reduceMotion]) {
    if (typeof value !== 'boolean') throw new TypeError('motion setting');
  }
  const nativeMotion = settings.visible && !settings.reduceMotion;
  return Object.freeze({
    visible: settings.visible, reduceMotion: settings.reduceMotion, nativeMotion,
    decorativeMotion: nativeMotion && settings.quality === 'high' && !settings.minimalFx,
    customerCapacity: settings.quality === 'low' ? 1 : 2,
    detailedIdle: nativeMotion && settings.quality === 'high' && !settings.minimalFx,
  });
}

/** Feed visible-frame delta, not wall-clock elapsed time. No hidden catch-up. */
export function advanceVisibleTime(seconds: number, deltaSeconds: number, policy: MotionPolicy): number {
  nonnegative(seconds, 'seconds'); nonnegative(deltaSeconds, 'deltaSeconds');
  return policy.nativeMotion ? seconds + Math.min(deltaSeconds, COZY_TIMING.maxFrameDeltaSeconds) : seconds;
}

export interface IdlePose {
  readonly chestLiftMetres: number;
  readonly headYawRadians: number;
  readonly headTiltRadians: number;
  readonly eyelidClosure: number; // 0=open, 1=closed; same face throughout.
}

export function sampleIdle(visibleSeconds: number, phase: number, policy: MotionPolicy): IdlePose {
  nonnegative(visibleSeconds, 'visibleSeconds'); nonnegative(phase, 'phase');
  if (!policy.nativeMotion) return {chestLiftMetres: 0, headYawRadians: 0, headTiltRadians: 0, eyelidClosure: 0};
  const offset = fraction(phase), detail = policy.detailedIdle ? 1 : 0.5;
  const blinkTime = ((visibleSeconds % COZY_TIMING.blinkPeriodSeconds) + offset * COZY_TIMING.blinkPeriodSeconds) % COZY_TIMING.blinkPeriodSeconds - 2.8;
  const eyelidClosure = blinkTime >= 0 && blinkTime <= COZY_TIMING.blinkDurationSeconds
    ? Math.sin(Math.PI * blinkTime / COZY_TIMING.blinkDurationSeconds) ** 2 : 0;
  return {
    chestLiftMetres: Math.sin(TAU * ((visibleSeconds % COZY_TIMING.breathPeriodSeconds) / COZY_TIMING.breathPeriodSeconds + offset)) * 0.003 * detail,
    headYawRadians: Math.sin((visibleSeconds % (TAU / 0.31)) * 0.31 + offset * TAU) * 0.028 * detail,
    headTiltRadians: Math.sin((visibleSeconds % (TAU / 0.23)) * 0.23 + offset * TAU) * 0.012 * detail,
    eyelidClosure,
  };
}

export interface WalkPose {
  readonly leftHipRadians: number;
  readonly rightHipRadians: number;
  readonly leftKneeRadians: number;
  readonly rightKneeRadians: number;
  readonly leftArmRadians: number;
  readonly rightArmRadians: number;
  readonly leftFootLiftMetres: number;
  readonly rightFootLiftMetres: number;
  readonly bodyLiftMetres: number;
}

/**
 * Distance comes from actual route displacement, not a wall-clock sine wave.
 * Positive hip pitch denotes forward swing; map axes/signs to the final rig.
 * Foot lifts are desired offsets, not solved IK or a foot-plant guarantee.
 * Adapter must smooth speed/start/stop and apply rest-pose-relative transforms.
 */
export function sampleWalk(distanceMetres: number, speedMetresPerSecond: number, policy: MotionPolicy): WalkPose {
  nonnegative(distanceMetres, 'distanceMetres'); nonnegative(speedMetresPerSecond, 'speedMetresPerSecond');
  const strength = policy.nativeMotion ? Math.min(1, speedMetresPerSecond / COZY_TIMING.referenceWalkMetresPerSecond) : 0;
  const cycle = (distanceMetres % COZY_TIMING.strideMetres) / COZY_TIMING.strideMetres;
  const swing = Math.sin(TAU * cycle);
  const left = Math.max(0, swing), right = Math.max(0, -swing);
  return {
    leftHipRadians: swing * 0.38 * strength, rightHipRadians: -swing * 0.38 * strength,
    leftKneeRadians: left * 0.5 * strength, rightKneeRadians: right * 0.5 * strength,
    leftArmRadians: -swing * 0.16 * strength, rightArmRadians: swing * 0.16 * strength,
    leftFootLiftMetres: left * 0.045 * strength, rightFootLiftMetres: right * 0.045 * strength,
    bodyLiftMetres: (1 - Math.cos(TAU * 2 * cycle)) * 0.004 * strength,
  };
}

/** Structural subset of a committed core Snapshot; inputs are never mutated. */
export interface PresentationSnapshot {
  readonly mode: string;
  readonly shopId: string;
  readonly revision: number;
  readonly eventSequence: number; // Sold UNITS, not transactions or shoppers.
  readonly commandIds: readonly string[];
  readonly shelves: readonly string[];
}
export interface CapturedCommand {
  readonly id: string;
  readonly kind: string;
  readonly itemId?: string;
  readonly quantity?: number;
  readonly slot?: number;
}
export interface CommitContext {
  readonly incarnation: string; // Stable within this save; change when replacing the save identity.
  readonly epoch: number; // Capture before await, not when the promise resolves.
  readonly source: 'command' | 'settle';
  readonly command?: CapturedCommand;
}
export type AcceptedAction =
  | Readonly<{kind: 'stock'; commandId: string; itemId: string; quantity: number}>
  | Readonly<{kind: 'display'; commandId: string; itemId: string; slot: number}>;
export interface CommittedReceipt {
  readonly streamKey: string;
  readonly epoch: number;
  readonly revision: number;
  readonly source: 'command' | 'settle';
  readonly soldUnits: number;
  readonly accepted?: AcceptedAction;
}

export function makeStreamKey(mode: string, shopId: string, incarnation: string): string {
  return JSON.stringify([text(mode, 'mode'), text(shopId, 'shopId'), text(incarnation, 'incarnation')]);
}

/**
 * Call ONLY with the actual successful persistence transition. This helper does
 * not certify a fabricated snapshot and must never run on ordinary load/render.
 * v9 buy is all-or-nothing: accepted quantity comes from the captured command,
 * never from net stock, because command() settles sales before applying buy.
 * If the future core supports partial fulfilment, replace quantity with its
 * authoritative accepted quantity and update this adapter contract.
 */
export function projectConfirmedCommit(before: PresentationSnapshot, after: PresentationSnapshot, context: CommitContext): CommittedReceipt {
  integer(before.revision, 'before revision'); integer(after.revision, 'after revision');
  integer(before.eventSequence, 'before eventSequence'); integer(after.eventSequence, 'after eventSequence');
  integer(context.epoch, 'epoch');
  if (before.mode !== after.mode || before.shopId !== after.shopId || after.revision <= before.revision || after.eventSequence < before.eventSequence) {
    throw new RangeError('not a same-stream forward commit; use baseline for load/import/mode');
  }
  if (context.source !== 'command' && context.source !== 'settle') throw new TypeError('source');
  if (context.source === 'settle' && context.command !== undefined) throw new TypeError('settle must not carry command acceptance');
  const command = context.command;
  let accepted: AcceptedAction | undefined;
  if (context.source === 'command' && command !== undefined) {
    text(command.id, 'command id'); text(command.kind, 'command kind');
    const newlyRecorded = !before.commandIds.includes(command.id) && after.commandIds.includes(command.id);
    if (newlyRecorded && command.kind === 'buy') {
      text(command.itemId!, 'itemId'); integer(command.quantity!, 'quantity');
      if (command.quantity === 0) throw new RangeError('positive accepted quantity required');
      accepted = Object.freeze({kind: 'stock', commandId: command.id, itemId: command.itemId!, quantity: command.quantity!});
    }
    if (newlyRecorded && command.kind === 'display') {
      text(command.itemId!, 'itemId'); integer(command.slot!, 'slot');
      const slot = command.slot!;
      if (slot >= before.shelves.length || slot >= after.shelves.length) throw new RangeError('slot');
      if (after.shelves[slot] === command.itemId && before.shelves[slot] !== after.shelves[slot]) {
        accepted = Object.freeze({kind: 'display', commandId: command.id, itemId: command.itemId!, slot});
      }
    }
  }
  return Object.freeze({
    streamKey: makeStreamKey(after.mode, after.shopId, context.incarnation), epoch: context.epoch,
    revision: after.revision, source: context.source, soldUnits: after.eventSequence - before.eventSequence,
    ...(accepted === undefined ? {} : {accepted}),
  });
}

export type ServiceCue =
  | Readonly<{kind: 'sale'; soldUnits: number}>
  | AcceptedAction;
export interface ServiceFrame {
  readonly receiptRevision: number;
  readonly cue: ServiceCue;
  readonly progress: number;
  readonly stage: 'prepare' | 'act' | 'release' | 'recover'; // Visual markers only.
}
export interface ReceiptSummary {
  readonly revision: number;
  readonly soldUnits: number;
  readonly accepted?: AcceptedAction;
}
export interface Observation {
  readonly status: 'ignored' | 'consumed';
  readonly reason: 'old-revision' | 'foreign-stream' | 'disposed' | 'stale-epoch' | 'hidden' | 'reduced-motion' | 'no-effect' | 'scheduled';
  readonly summary?: ReceiptSummary; // Independent of the lossy visual queue.
  readonly mayShowSummary: boolean; // False for hidden or stale captured epoch.
  readonly replacedPending: boolean;
}
interface Batch { revision: number; cues: readonly ServiceCue[]; index: number; elapsed: number }

function validateReceipt(receipt: CommittedReceipt): void {
  text(receipt.streamKey, 'streamKey'); integer(receipt.epoch, 'epoch');
  integer(receipt.revision, 'revision'); integer(receipt.soldUnits, 'soldUnits');
  if (receipt.source !== 'command' && receipt.source !== 'settle') throw new TypeError('source');
  if (receipt.accepted !== undefined) {
    if (receipt.source !== 'command') throw new TypeError('settle acceptance');
    const action = receipt.accepted;
    text(action.commandId, 'commandId'); text(action.itemId, 'itemId');
    if (action.kind === 'stock') {
      integer(action.quantity, 'quantity'); if (action.quantity === 0) throw new RangeError('quantity');
    } else if (action.kind === 'display') integer(action.slot, 'slot');
    else throw new TypeError('accepted kind');
  }
}
function duration(cue: ServiceCue): number {
  return cue.kind === 'sale' ? COZY_TIMING.saleSeconds : cue.kind === 'stock' ? COZY_TIMING.stockSeconds : COZY_TIMING.displaySeconds;
}

/** One active commit batch + one latest pending batch, each at most two cues. */
export class NativeServiceSequencer {
  private watermark: number;
  private epoch: number;
  private active: Batch | undefined;
  private pending: Batch | undefined;
  private disposed = false;

  constructor(readonly streamKey: string, baselineRevision: number, initialEpoch: number) {
    text(streamKey, 'streamKey');
    this.watermark = integer(baselineRevision, 'baselineRevision');
    this.epoch = integer(initialEpoch, 'initialEpoch');
  }
  get consumedRevision(): number { return this.watermark; }
  get presentationEpoch(): number { return this.epoch; }
  get queuedBatchCount(): number { return Number(!!this.active) + Number(!!this.pending); }

  /** Cancel pose/prop playback in the renderer too; this only clears its clock. */
  cancelVisuals(): void { this.active = undefined; this.pending = undefined; }

  invalidatePresentation(nextEpoch: number): void {
    integer(nextEpoch, 'nextEpoch');
    if (nextEpoch <= this.epoch) throw new RangeError('epoch must increase');
    this.epoch = nextEpoch;
    this.cancelVisuals(); // Deduplication watermark intentionally survives.
  }

  /** Reload/import/offline reconciliation is acknowledged, never replayed. */
  resetBaseline(loadedRevision: number, nextEpoch: number): void {
    integer(loadedRevision, 'loadedRevision');
    this.invalidatePresentation(nextEpoch);
    this.watermark = Math.max(this.watermark, loadedRevision);
  }

  observe(receipt: CommittedReceipt, policy: MotionPolicy): Observation {
    validateReceipt(receipt); // Malformed input throws before changing watermark.
    const ignore = (reason: Observation['reason']): Observation => ({status: 'ignored', reason, mayShowSummary: false, replacedPending: false});
    if (this.disposed) return ignore('disposed');
    if (receipt.streamKey !== this.streamKey) return ignore('foreign-stream');
    if (receipt.revision <= this.watermark) return ignore('old-revision');
    this.watermark = receipt.revision; // CONSUME BEFORE epoch/visibility gating.
    const accepted = receipt.accepted === undefined ? undefined : Object.freeze({...receipt.accepted});
    const summary: ReceiptSummary = Object.freeze({revision: receipt.revision, soldUnits: receipt.soldUnits, ...(accepted === undefined ? {} : {accepted})});
    const hasEffect = receipt.soldUnits > 0 || accepted !== undefined;
    const current = receipt.epoch === this.epoch;
    const base = {status: 'consumed' as const, summary, mayShowSummary: hasEffect && current && policy.visible, replacedPending: false};
    if (!current) return {...base, reason: 'stale-epoch'};
    if (!policy.nativeMotion) {
      this.cancelVisuals();
      return {...base, reason: !policy.visible ? 'hidden' : 'reduced-motion'};
    }
    if (!hasEffect) return {...base, reason: 'no-effect'};
    // Direct command feedback goes first; a simultaneous sale still gets a cue.
    // A sale is ONE generic vignette, regardless of soldUnits. No buyer or SKU.
    const cues: ServiceCue[] = [];
    if (accepted !== undefined) cues.push(accepted);
    if (receipt.soldUnits > 0) cues.push(Object.freeze({kind: 'sale', soldUnits: receipt.soldUnits}));
    const batch: Batch = {revision: receipt.revision, cues: Object.freeze(cues), index: 0, elapsed: 0};
    if (!this.active) this.active = batch;
    else {
      const replacedPending = this.pending !== undefined;
      this.pending = batch; // Older pending visuals may be dropped, not state/UI.
      return {...base, reason: 'scheduled', replacedPending};
    }
    return {...base, reason: 'scheduled'};
  }

  /** Advance only visible render deltas; long gaps are discarded, not replayed. */
  tick(deltaSeconds: number, policy: MotionPolicy): ServiceFrame | undefined {
    nonnegative(deltaSeconds, 'deltaSeconds');
    if (this.disposed || !policy.nativeMotion) { this.cancelVisuals(); return undefined; }
    let remaining = Math.min(deltaSeconds, COZY_TIMING.maxFrameDeltaSeconds);
    while (this.active && remaining > 0) {
      const cue = this.active.cues[this.active.index]!;
      const left = duration(cue) - this.active.elapsed;
      const used = Math.min(left, remaining);
      this.active.elapsed += used; remaining -= used;
      if (this.active.elapsed >= duration(cue)) {
        this.active.index++; this.active.elapsed = 0;
        if (this.active.index >= this.active.cues.length) {
          this.active = this.pending; this.pending = undefined;
        }
      }
    }
    return this.current();
  }

  current(): ServiceFrame | undefined {
    if (!this.active || this.disposed) return undefined;
    const cue = this.active.cues[this.active.index]!;
    const progress = Math.min(1, this.active.elapsed / duration(cue));
    return Object.freeze({
      receiptRevision: this.active.revision, cue, progress,
      stage: progress < 0.2 ? 'prepare' : progress < 0.7 ? 'act' : progress < 0.9 ? 'release' : 'recover',
    });
  }

  dispose(): void { this.cancelVisuals(); this.disposed = true; }
}
