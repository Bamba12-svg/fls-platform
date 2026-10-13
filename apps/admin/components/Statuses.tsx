'use client';

import type { LeadStatus } from '@fls/db';
import type { OrderStatus } from '@fls/core';
import { setLeadStatus, setOrderStatus } from '@/lib/actions';
import { LEAD_STATUS, ORDER_STATUS } from '@/lib/format';
import { StatusSelect } from './ui';

export const OrderStatusSelect = ({ id, value }: { id: string; value: OrderStatus }) => <StatusSelect label="Statut de la commande" value={value} options={Object.entries(ORDER_STATUS)} onSave={(v) => setOrderStatus(id, v as OrderStatus)} />;
export const LeadStatusSelect = ({ id, value }: { id: string; value: LeadStatus }) => <StatusSelect label="Statut de la demande" value={value} options={Object.entries(LEAD_STATUS)} onSave={(v) => setLeadStatus(id, v as LeadStatus)} />;
