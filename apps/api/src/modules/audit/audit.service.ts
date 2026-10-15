import { Injectable } from '@nestjs/common';
import { AuditEvent, AuditActionType, AuditActor, AuditTarget, AuditDelta } from '@hosos/types';

@Injectable()
export class AuditService {
  private auditLogs: AuditEvent[] = [];

  async logEvent(params: {
    actor: AuditActor;
    actionType: AuditActionType;
    targetEntity: AuditTarget;
    delta: AuditDelta;
    terminalId: string;
    ipAddress?: string;
    authorizedByManagerId?: string;
    reason?: string;
  }): Promise<AuditEvent> {
    const event: AuditEvent = {
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      actor: params.actor,
      actionType: params.actionType,
      targetEntity: params.targetEntity,
      delta: params.delta,
      deviceMetadata: {
        terminalId: params.terminalId,
        ipAddress: params.ipAddress,
      },
      authorizedByManagerId: params.authorizedByManagerId,
      reason: params.reason,
    };

    this.auditLogs.unshift(event);
    return event;
  }

  async getEventsForEntity(entityType: string, entityId: string): Promise<AuditEvent[]> {
    return this.auditLogs.filter(
      (log) => log.targetEntity.entityType === entityType && log.targetEntity.entityId === entityId
    );
  }

  async getAllEvents(limit = 100): Promise<AuditEvent[]> {
    return this.auditLogs.slice(0, limit);
  }
}
