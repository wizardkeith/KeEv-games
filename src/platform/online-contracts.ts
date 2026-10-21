// Interfaces only. No online authority or account services have been implemented.
import type {Snapshot} from '../core/contracts';
export interface ICloudSaveService {load(accountId:string):Promise<Snapshot|null>;save(accountId:string,state:Snapshot,expectedRevision:number):Promise<void>}
export interface IWorldStateService {trustedTime():Promise<number>;worldId(cityId:string):Promise<string>}
export interface ILeaderboardService {submitTrustedSnapshot(accountId:string,snapshotId:string):Promise<void>}
export interface IEntitlementService {has(accountId:string,entitlementId:string):Promise<boolean>}
