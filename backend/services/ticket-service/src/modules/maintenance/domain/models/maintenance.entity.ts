export enum MaintenanceStatus {
  SCHEDULED = "SCHEDULED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELED = "CANCELED",
}

export class Maintenance {
  private readonly _id?: string;
  private _ticketId: string | null;
  private _apartmentId: string | null;
  private _providerId: string | null;
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
  get ticketId(): string | null { return this._ticketId; }
  get apartmentId(): string | null { return this._apartmentId; }
  get providerId(): string | null { return this._providerId; }
  get status(): MaintenanceStatus { return this._status; }
  get value(): number { return this._value; }
  get executionDate(): Date { return this._executionDate; }
  get createdAt(): Date | undefined { return this._createdAt; }
  get updatedAt(): Date | undefined { return this._updatedAt; }

  withTicketId(ticketId: string | null): this { this._ticketId = ticketId; return this; }
  withApartmentId(apartmentId: string | null): this { this._apartmentId = apartmentId; return this; }
  withProviderId(providerId: string | null): this { this._providerId = providerId; return this; }
  withStatus(status: MaintenanceStatus): this { this._status = status; return this; }
  withValue(value: number): this { this._value = value; return this; }
  withExecutionDate(executionDate: Date): this { this._executionDate = executionDate; return this; }

  static restore(props?: {
    id?: string;
    ticketId?: string | null;
    apartmentId?: string | null;
    providerId?: string | null;
    status: MaintenanceStatus;
    value: number;
    executionDate: Date;
    createdAt?: Date;
    updatedAt?: Date;
  }): Maintenance | null {
    if (!props) return null;
    const maintenance = new Maintenance(props.id, props.createdAt, props.updatedAt);
    maintenance._ticketId = props.ticketId ?? null;
    maintenance._apartmentId = props.apartmentId ?? null;
    maintenance._providerId = props.providerId ?? null;
    maintenance._status = props.status;
    maintenance._value = props.value;
    maintenance._executionDate = props.executionDate;
    return maintenance;
  }
}
