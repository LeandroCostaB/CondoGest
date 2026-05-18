import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcrypt";
import { randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";

import { users } from "@user/infra/database/schemas/user.schema";
import { db } from "@user/infra/database/database.config";
import { Permission } from "@shared/domain/enums/permission.enum";
import { NotificationPayloadService } from "./notification-payload.service";
import type { CreateResidentDto } from "../dto/create-resident.dto";

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private configService: ConfigService,
        private notificationPayloadService: NotificationPayloadService,
    ) { }

    // Método auxiliar para definir o que cada Role pode fazer
    private getPermissionsByRole(role: string): string[] {
        if (role === 'SINDICO') {
            // Síndico tem acesso a tudo (todas as chaves do Enum)
            return Object.values(Permission);
        }
        
        // Morador tem acesso limitado
        return [
            Permission.USERS_READ, // Pode ver os próprios dados
        ];
    }

    async register(data: any) {
        const existingUser = await db.select().from(users).where(eq(users.email, data.email));
        if (existingUser.length > 0) {
            throw new ConflictException('Este e-mail já está em uso.');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(data.senha, salt);

        const [newUser] = await db.insert(users).values({
            nome: data.nome,
            email: data.email,
            senha: hashedPassword,
            role: data.role || 'MORADOR',
        }).returning({
            id: users.id,
            nome: users.nome,
            email: users.email,
            role: users.role,
        });

        return newUser;
    }

    async createResident(createdByUserId: string, data: CreateResidentDto) {
        const [creatorUser] = await db.select().from(users).where(eq(users.id, createdByUserId));
        if (!creatorUser || creatorUser.role !== "SINDICO") {
            throw new ForbiddenException("Somente o síndico pode criar moradores.");
        }

        const existingUser = await db.select().from(users).where(eq(users.email, data.email));
        if (existingUser.length > 0) {
            throw new ConflictException("Este e-mail já está em uso.");
        }

        const temporaryPassword = this.generateTemporaryPassword();
        const hashedPassword = await this.hashPassword(temporaryPassword);

        const [newUser] = await db.insert(users).values({
            nome: data.nome,
            email: data.email,
            senha: hashedPassword,
            role: "MORADOR",
        }).returning({
            id: users.id,
            nome: users.nome,
            email: users.email,
            role: users.role,
        });

        return {
            user: newUser,
            notification: this.notificationPayloadService.build({
                to: newUser.email,
                channel: "email",
                title: "Bem-vindo ao CondoGest",
                body: `Olá, ${newUser.nome}! Sua senha temporária é: ${temporaryPassword}`,
            }),
        };
    }

    async login(email: string, senhaPlana: string) {
        const [user] = await db.select().from(users).where(eq(users.email, email));

        if (!user) {
            throw new UnauthorizedException('E-mail ou senha incorretos.');
        }

        const isPasswordValid = await bcrypt.compare(senhaPlana, user.senha);
        if (!isPasswordValid) {
            throw new UnauthorizedException('E-mail ou senha incorretos.');
        }

        const permissions = this.getPermissionsByRole(user.role);

        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            permissions: permissions // O Guard vai ler isso aqui!
        };

        return {
            access_token: await this.jwtService.signAsync(payload, {
                secret: this.configService.get<string>('JWT_SECRET'),
                expiresIn: '1d',
            }),
            user: {
                id: user.id,
                nome: user.nome,
                role: user.role,
                permissions: permissions // Útil para o frontend saber o que mostrar
            }
        };
    }

    private generateTemporaryPassword(length = 10): string {
        const raw = randomBytes(length)
            .toString("base64")
            .replace(/[^a-zA-Z0-9]/g, "");

        return raw.slice(0, length);
    }

    private async hashPassword(password: string): Promise<string> {
        const salt = await bcrypt.genSalt(10);
        return bcrypt.hash(password, salt);
    }
}
