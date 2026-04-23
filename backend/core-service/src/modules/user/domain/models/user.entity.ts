export enum UserType {
  SINDICO = "SINDICO",
  MORADOR = "MORADOR",
}

export class User {
  private readonly _id?: string;
  private _name: string;
  private _email: string;
  private _passwordHash: string;
  private _type: UserType;
  private readonly _createdAt?: Date;
  private readonly _updatedAt?: Date;

  private constructor(id?: string, createdAt?: Date, updatedAt?: Date) {
    this._id = id;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
  }

  get id(): string | undefined {
    return this._id;
  }
  get name(): string {
    return this._name;
  }
  get email(): string {
    return this._email;
  }
  get passwordHash(): string {
    return this._passwordHash;
  }
  get type(): UserType {
    return this._type;
  }
  get createdAt(): Date | undefined {
    return this._createdAt;
  }
  get updatedAt(): Date | undefined {
    return this._updatedAt;
  }

  withName(name: string) {
    this._name = name;
    return this;
  }
  withEmail(email: string) {
    this._email = email;
    return this;
  }
  withPasswordHash(passwordHash: string) {
    this._passwordHash = passwordHash;
    return this;
  }
  withType(type: UserType) {
    this._type = type;
    return this;
  }

  static restore(props?: {
    id?: string;
    name: string;
    email: string;
    passwordHash: string;
    type: UserType;
    createdAt?: Date;
    updatedAt?: Date;
  }): User | null {
    if (!props) return null;
    const user = new User(props.id, props.createdAt, props.updatedAt);
    user._name = props.name;
    user._email = props.email;
    user._passwordHash = props.passwordHash;
    user._type = props.type;
    return user;
  }
}
