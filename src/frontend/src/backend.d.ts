import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Schedule {
    departureTime: string;
    isEnabled: boolean;
    destinationLabel: string;
}
export interface UserProfile {
    name: string;
}
export interface ChecklistItem {
    id: bigint;
    isChecked: boolean;
    order: bigint;
    text: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addItem(text: string, order: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getItems(): Promise<Array<ChecklistItem>>;
    getLockerStatus(): Promise<boolean>;
    getSchedule(): Promise<Schedule | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    lockLocker(): Promise<void>;
    removeItem(id: bigint): Promise<void>;
    resetAllChecks(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setSchedule(departureTime: string, destinationLabel: string, isEnabled: boolean): Promise<void>;
    toggleItem(id: bigint): Promise<void>;
    unlockLocker(): Promise<boolean>;
}
