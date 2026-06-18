export class Apartment {
  private readonly _id?: string;
  private _number!: string;
  private _block?: string | null;
  private _floor?: number | null;
  private _condominiumId!: string;
  private _userId?: string | null;
  private readonly _createdAt?: Date;
  private readonly _updatedAt?: Date;

  private constructor(id?: string, createdAt?: Date, updatedAt?: Date) {
    this._id = id;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
  }

  get id(): string | undefined { return this._id; }
  get number(): string { return this._number; }
  get block(): string | null | undefined { return this._block; }
  get floor(): number | null | undefined { return this._floor; }
  get condominiumId(): string { return this._condominiumId; }
  get userId(): string | null | undefined { return this._userId; }
  get createdAt(): Date | undefined { return this._createdAt; }
  get updatedAt(): Date | undefined { return this._updatedAt; }

  withNumber(number: string) { this._number = number; return this; }
  withBlock(block?: string | null) { this._block = block; return this; }
  withFloor(floor?: number | null) { this._floor = floor; return this; }
  withCondominiumId(condominiumId: string) { this._condominiumId = condominiumId; return this; }
  withUserId(userId?: string | null) { this._userId = userId; return this; }

  static restore(props?: {
    id?: string;
    number: string;
    block?: string | null;
    floor?: number | null;
    condominiumId: string;
    userId?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
  }): Apartment | null {
    if (!props) return null;
    const a = new Apartment(props.id, props.createdAt, props.updatedAt);
    a._number = props.number;
    a._block = props.block ?? null;
    a._floor = props.floor ?? null;
    a._condominiumId = props.condominiumId;
    a._userId = props.userId ?? null;
    return a;
  }
}
