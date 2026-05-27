export enum ProviderSpecialty {
  ELECTRICIAN = "ELECTRICIAN",
  PLUMBER = "PLUMBER",
  PAINTER = "PAINTER",
  CARPENTER = "CARPENTER",
  LOCKSMITH = "LOCKSMITH",
  GENERAL = "GENERAL",
}

export class Provider {
  private readonly _id?: string;
  private _name: string;
  private _phone: string;
  private _specialty: ProviderSpecialty;
  private readonly _createdAt?: Date;
  private readonly _updatedAt?: Date;

  private constructor(id?: string, createdAt?: Date, updatedAt?: Date) {
    this._id = id;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
  }

  get id(): string | undefined { return this._id; }
  get name(): string { return this._name; }
  get phone(): string { return this._phone; }
  get specialty(): ProviderSpecialty { return this._specialty; }
  get createdAt(): Date | undefined { return this._createdAt; }
  get updatedAt(): Date | undefined { return this._updatedAt; }

  withName(name: string): this { this._name = name; return this; }
  withPhone(phone: string): this { this._phone = phone; return this; }
  withSpecialty(specialty: ProviderSpecialty): this { this._specialty = specialty; return this; }

  static restore(props?: {
    id?: string;
    name: string;
    phone: string;
    specialty: ProviderSpecialty;
    createdAt?: Date;
    updatedAt?: Date;
  }): Provider | null {
    if (!props) return null;
    const provider = new Provider(props.id, props.createdAt, props.updatedAt);
    provider._name = props.name;
    provider._phone = props.phone;
    provider._specialty = props.specialty;
    return provider;
  }
}
