export type UserRole = 'SINDICO' | 'MORADOR';

export class User {
  private readonly _id?: string;
  private _nome: string;
  private _email: string;
  private _senha: string;
  private _role: UserRole;
  private readonly _createdAt?: Date;
  private readonly _updatedAt?: Date;

  private constructor(id?: string, createdAt?: Date, updatedAt?: Date) {
    this._id = id;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
  }

  get id(): string | undefined { return this._id; }
  get nome(): string { return this._nome; }
  get email(): string { return this._email; }
  get senha(): string { return this._senha; }
  get role(): UserRole { return this._role; }
  get createdAt(): Date | undefined { return this._createdAt; }
  get updatedAt(): Date | undefined { return this._updatedAt; }

  withNome(nome: string): this { this._nome = nome; return this; }
  withEmail(email: string): this { this._email = email; return this; }
  withSenha(senha: string): this { this._senha = senha; return this; }
  withRole(role: UserRole): this { this._role = role; return this; }

  static restore(props?: {
    id?: string;
    nome: string;
    email: string;
    senha: string;
    role: UserRole;
    createdAt?: Date;
    updatedAt?: Date;
  }): User | null {
    if (!props) return null;
    const user = new User(props.id, props.createdAt, props.updatedAt);
    user._nome = props.nome;
    user._email = props.email;
    user._senha = props.senha;
    user._role = props.role;
    return user;
  }
}
