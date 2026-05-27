export enum MaintenanceStatus {
  SCHEDULED = "SCHEDULED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELED = "CANCELED",
}

export class Maintenance {
  private readonly _id?: string;
  private _ticketId: string;
  private _providerId: string;
  private _status: MaintenanceStatus;
  private _value: number;
  private _executionDate: Date;
  private readonly _createdAt?: Date;
  private readonly _updatedAt?: Date;

  private constructor(id?: string, createdAt?: Date, updatedAt?: Date) {
    this._id = id;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
  }

  get id(): string | undefined { return this._id; }
  get ticketId(): string { return this._ticketId; }
  get providerId(): string { return this._providerId; }
  get status(): MaintenanceStatus { return this._status; }
  get value(): number { return this._value; }
  get executionDate(): Date { return this._executionDate; }
  get createdAt(): Date | undefined { return this._createdAt; }
  get updatedAt(): Date | undefined { return this._updatedAt; }

  withTicketId(ticketId: string): this { this._ticketId = ticketId; return this; }
  withProviderId(providerId: string): this { this._providerId = providerId; return this; }
  withStatus(status: MaintenanceStatus): this { this._status = status; return this; }
  withValue(value: number): this { this._value = value; return this; }
  withExecutionDate(executionDate: Date): this { this._executionDate = executionDate; return this; }

  static restore(props?: {
    id?: string;
    ticketId: string;
    providerId: string;
    status: MaintenanceStatus;
    value: number;
    executionDate: Date;
    createdAt?: Date;
    updatedAt?: Date;
  }): Maintenance | null {
    if (!props) return null;
    const maintenance = new Maintenance(props.id, props.createdAt, props.updatedAt);
    maintenance._ticketId = props.ticketId;
    maintenance._providerId = props.providerId;
    maintenance._status = props.status;
    maintenance._value = props.value;
    maintenance._executionDate = props.executionDate;
    return maintenance;
  }
}
