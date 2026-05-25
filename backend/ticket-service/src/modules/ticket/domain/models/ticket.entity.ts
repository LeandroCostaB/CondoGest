export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
  CANCELED = 'CANCELED',
}

export class Ticket {
  private readonly _id?: string;
  private _title: string;
  private _description: string;
  private _location: string;
  private _status: TicketStatus;
  private _residentId: string;
  private _apartmentId: string;
  private readonly _createdAt?: Date;
  private readonly _updatedAt?: Date;

  private constructor(id?: string, createdAt?: Date, updatedAt?: Date) {
    this._id = id;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
  }

  get id(): string | undefined { return this._id; }
  get title(): string { return this._title; }
  get description(): string { return this._description; }
  get location(): string { return this._location; }
  get status(): TicketStatus { return this._status; }
  get residentId(): string { return this._residentId; }
  get apartmentId(): string { return this._apartmentId; }
  get createdAt(): Date | undefined { return this._createdAt; }
  get updatedAt(): Date | undefined { return this._updatedAt; }

  withTitle(title: string): this { this._title = title; return this; }
  withDescription(description: string): this { this._description = description; return this; }
  withLocation(location: string): this { this._location = location; return this; }
  withStatus(status: TicketStatus): this { this._status = status; return this; }

  static restore(props?: {
    id?: string;
    title: string;
    description: string;
    location: string;
    status: TicketStatus;
    residentId: string;
    apartmentId: string;
    createdAt?: Date;
    updatedAt?: Date;
  }): Ticket | null {
    if (!props) return null;
    const ticket = new Ticket(props.id, props.createdAt, props.updatedAt);
    ticket._title = props.title;
    ticket._description = props.description;
    ticket._location = props.location;
    ticket._status = props.status;
    ticket._residentId = props.residentId;
    ticket._apartmentId = props.apartmentId;
    return ticket;
  }
}
