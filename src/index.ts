import { local, LocalDriver } from './drivers/local';

export interface Drivers {
  local: LocalDriver;
}

export const drivers: Drivers = {
  local
};