export enum CondominiumStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

export class Condominium {
  private readonly _id?: string;
  private _name!: string;
  private _address!: string;
  private _userId!: string;
  private _status!: CondominiumStatus;
  private readonly _createdAt?: Date;
  private readonly _updatedAt?: Date;

  private constructor(id?: string, createdAt?: Date, updatedAt?: Date) {
    this._id = id;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
  }

  get id(): string | undefined { return this._id; }
  get name(): string { return this._name; }
  get address(): string { return this._address; }
  get userId(): string { return this._userId; }
  get status(): CondominiumStatus { return this._status; }
  get createdAt(): Date | undefined { return this._createdAt; }
  get updatedAt(): Date | undefined { return this._updatedAt; }

  withName(name: string) { this._name = name; return this; }
  withAddress(address: string) { this._address = address; return this; }
  withUserId(userId: string) { this._userId = userId; return this; }
  withStatus(status: CondominiumStatus) { this._status = status; return this; }

  static restore(props?: {
    id?: string;
    name: string;
    address: string;
    userId: string;
    status: CondominiumStatus;
    createdAt?: Date;
    updatedAt?: Date;
  }): Condominium | null {
    if (!props) return null;
    const c = new Condominium(props.id, props.createdAt, props.updatedAt);
    c._name = props.name;
    c._address = props.address;
    c._userId = props.userId;
    c._status = props.status;
    return c;
  }
}
