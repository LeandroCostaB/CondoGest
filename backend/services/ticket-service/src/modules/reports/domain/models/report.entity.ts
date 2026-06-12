export enum ReportType {
  MONTHLY = "MONTHLY",
  CUSTOM = "CUSTOM",
}

export enum ReportStatus {
  PENDING = "PENDING",
  GENERATED = "GENERATED",
  EXPORTED = "EXPORTED",
}

export class Report {
  private readonly _id?: string;
  private _condominiumId: string;
  private _type: ReportType;
  private _status: ReportStatus;
  private _month?: number;
  private _year?: number;
  private _startDate?: Date;
  private _endDate?: Date;
  private _data?: Record<string, unknown>;
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
  get condominiumId(): string {
    return this._condominiumId;
  }
  get type(): ReportType {
    return this._type;
  }
  get status(): ReportStatus {
    return this._status;
  }
  get month(): number | undefined {
    return this._month;
  }
  get year(): number | undefined {
    return this._year;
  }
  get startDate(): Date | undefined {
    return this._startDate;
  }
  get endDate(): Date | undefined {
    return this._endDate;
  }
  get data(): Record<string, unknown> | undefined {
    return this._data;
  }
  get createdAt(): Date | undefined {
    return this._createdAt;
  }
  get updatedAt(): Date | undefined {
    return this._updatedAt;
  }

  withCondominiumId(condominiumId: string): this {
    this._condominiumId = condominiumId;
    return this;
  }
  withType(type: ReportType): this {
    this._type = type;
    return this;
  }
  withStatus(status: ReportStatus): this {
    this._status = status;
    return this;
  }
  withMonth(month: number): this {
    this._month = month;
    return this;
  }
  withYear(year: number): this {
    this._year = year;
    return this;
  }
  withStartDate(startDate: Date): this {
    this._startDate = startDate;
    return this;
  }
  withEndDate(endDate: Date): this {
    this._endDate = endDate;
    return this;
  }
  withData(data: Record<string, unknown>): this {
    this._data = data;
    return this;
  }

  static restore(props?: {
    id?: string;
    condominiumId: string;
    type: ReportType;
    status: ReportStatus;
    month?: number;
    year?: number;
    startDate?: Date;
    endDate?: Date;
    data?: Record<string, unknown>;
    createdAt?: Date;
    updatedAt?: Date;
  }): Report | null {
    if (!props) return null;
    const report = new Report(props.id, props.createdAt, props.updatedAt);
    report._condominiumId = props.condominiumId;
    report._type = props.type;
    report._status = props.status;
    report._month = props.month;
    report._year = props.year;
    report._startDate = props.startDate;
    report._endDate = props.endDate;
    report._data = props.data;
    return report;
  }
}
