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
  private _condominiumId: string | null;
  private _providerId: string | null;
  private _status: MaintenanceStatus;
  private _value: number;
  private _executionDate: Date;
  private _type: string | null;
  private _local: string | null;
  private _priority: string | null;
  private _providerName: string | null;
  private _providerContact: string | null;
  private _observation: string | null;
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
  get condominiumId(): string | null { return this._condominiumId; }
  get providerId(): string | null { return this._providerId; }
  get status(): MaintenanceStatus { return this._status; }
  get value(): number { return this._value; }
  get executionDate(): Date { return this._executionDate; }
  get type(): string | null { return this._type; }
  get local(): string | null { return this._local; }
  get priority(): string | null { return this._priority; }
  get providerName(): string | null { return this._providerName; }
  get providerContact(): string | null { return this._providerContact; }
  get observation(): string | null { return this._observation; }
  get createdAt(): Date | undefined { return this._createdAt; }
  get updatedAt(): Date | undefined { return this._updatedAt; }

  withTicketId(v: string | null): this { this._ticketId = v; return this; }
  withApartmentId(v: string | null): this { this._apartmentId = v; return this; }
  withCondominiumId(v: string | null): this { this._condominiumId = v; return this; }
  withProviderId(v: string | null): this { this._providerId = v; return this; }
  withStatus(v: MaintenanceStatus): this { this._status = v; return this; }
  withValue(v: number): this { this._value = v; return this; }
  withExecutionDate(v: Date): this { this._executionDate = v; return this; }
  withType(v: string | null): this { this._type = v; return this; }
  withLocal(v: string | null): this { this._local = v; return this; }
  withPriority(v: string | null): this { this._priority = v; return this; }
  withProviderName(v: string | null): this { this._providerName = v; return this; }
  withProviderContact(v: string | null): this { this._providerContact = v; return this; }
  withObservation(v: string | null): this { this._observation = v; return this; }

  static restore(props?: {
    id?: string;
    ticketId?: string | null;
    apartmentId?: string | null;
    condominiumId?: string | null;
    providerId?: string | null;
    status: MaintenanceStatus;
    value: number;
    executionDate: Date;
    type?: string | null;
    local?: string | null;
    priority?: string | null;
    providerName?: string | null;
    providerContact?: string | null;
    observation?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
  }): Maintenance | null {
    if (!props) return null;
    const m = new Maintenance(props.id, props.createdAt, props.updatedAt);
    m._ticketId = props.ticketId ?? null;
    m._apartmentId = props.apartmentId ?? null;
    m._condominiumId = props.condominiumId ?? null;
    m._providerId = props.providerId ?? null;
    m._status = props.status;
    m._value = props.value;
    m._executionDate = props.executionDate;
    m._type = props.type ?? null;
    m._local = props.local ?? null;
    m._priority = props.priority ?? null;
    m._providerName = props.providerName ?? null;
    m._providerContact = props.providerContact ?? null;
    m._observation = props.observation ?? null;
    return m;
  }
}
