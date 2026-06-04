/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id_user: string;
  name: string;
  email: string;
  role: 'Admin' | 'User';
  approved?: boolean;
  uid?: string;
  createdAt?: string;
}

export interface Ustadz {
  id: string;
  name: string;
  phone: string;
  createdAt?: string;
}

export interface AssetDetail {
  id: string;
  name: string;
  value: number;
}

export type RelationshipType =
  | 'suami'
  | 'istri'
  | 'anak_lk'
  | 'anak_pr'
  | 'ayah'
  | 'ibu'
  | 'sdra_lk'
  | 'sdra_pr';

export interface Heir {
  id: string;
  relationship: RelationshipType;
  gender: 'Pria' | 'Wanita';
  count: number;
}

export interface FinancialData {
  total_harta: number;
  hutang: number;
  wasiat: number;
  biaya_pemakaman: number;
  harta_rincian?: AssetDetail[];
}

export interface FaraidResultItem {
  name: string;
  relationship: RelationshipType;
  relationshipLabel: string;
  category: 'ASHABUL FURUD' | 'ASHABAH';
  originalShareText: string;
  percentage: number;
  nominalValue: number;
  notes: string;
}

export interface CalculationResult {
  id_hasil: string;
  id_pewaris: string;
  nama_pewaris: string;
  financials: FinancialData;
  tirkah: number;
  heirs: FaraidResultItem[];
  appliedCalculations: {
    hasAul: boolean;
    hasRadd: boolean;
    hasGharrawain: boolean;
  };
}
