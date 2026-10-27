import {
  Listing,
  Reservation,
  AdminTask,
  ConditionReport,
  AssetInventoryItem,
} from './types';
import cloudinarySeedData from './cloudinarySeedData.json';

export const USD_TO_RWF_RATE = 1350;

export const INITIAL_LISTINGS: Listing[] =
  cloudinarySeedData.listings as unknown as Listing[];

export const INITIAL_RESERVATIONS: Reservation[] =
  cloudinarySeedData.reservations as unknown as Reservation[];

export const INITIAL_ADMIN_TASKS: AdminTask[] =
  cloudinarySeedData.adminTasks as unknown as AdminTask[];

export const INITIAL_CONDITION_REPORTS: ConditionReport[] =
  cloudinarySeedData.conditionReports as unknown as ConditionReport[];

export const INITIAL_INVENTORY_ITEMS: AssetInventoryItem[] =
  cloudinarySeedData.inventory as unknown as AssetInventoryItem[];

export const KIGALI_NEIGHBORHOODS = [
  { name: 'All Neighborhoods', value: 'all', desc: 'Across Greater Kigali' },
  {
    name: 'Kiyovu',
    value: 'Kiyovu',
    desc: 'Diplomatic hill, serene tree-lined boulevards',
  },
  {
    name: 'Nyarutarama',
    value: 'Nyarutarama',
    desc: 'Golf course, embassies & luxury estates',
  },
  {
    name: 'Kimihurura',
    value: 'Kimihurura',
    desc: 'Kigali Convention Centre, top dining & cafes',
  },
  {
    name: 'Kigali Airport / Kanombe',
    value: 'Kigali Airport',
    desc: 'Direct airport terminal pickups & quick transit',
  },
  {
    name: 'Gacuriro',
    value: 'Gacuriro',
    desc: 'Scenic ridges, family residences & hill views',
  },
  {
    name: 'Kacyiru',
    value: 'Kacyiru',
    desc: 'Government ministries & King Faisal Hospital',
  },
];
