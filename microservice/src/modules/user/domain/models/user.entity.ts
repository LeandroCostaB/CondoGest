export enum UserStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

export class User {
  private readonly _id?: string;
  private _startDate: Date;
  private _endDate: Date;
  private _status: UserStatus;
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

  get startDate(): Date {
    return this._startDate;
  }

  get endDate(): Date {
    return this._endDate;
  }

  get status(): UserStatus {
    return this._status;
  }

  get createdAt(): Date | undefined {
    return this._createdAt;
  }

  get updatedAt(): Date | undefined {
    return this._updatedAt;
  }

  withStartDate(startDate: Date) {
    this._startDate = startDate;
    return this;
  }

  withEndDate(endDate: Date) {
    this._endDate = endDate;
    return this;
  }

  withStatus(status: UserStatus) {
    this._status = status;
    return this;
  }

  static restore(props?: {
    id?: string;
    startDate: Date;
    endDate: Date;
    status: UserStatus;
    createdAt?: Date;
    updatedAt?: Date;
  }): User | null {
    if (!props) return null;

    const user = new User(
      props.id,
      props.createdAt,
      props.updatedAt,
    );

    user._startDate = props.startDate;
    user._endDate = props.endDate;
    user._status = props.status;

    return user;
  }
}
