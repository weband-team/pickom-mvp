
import { BaseUserData } from "./auth";

export interface Sender extends BaseUserData{

    sentPackages: number;
}