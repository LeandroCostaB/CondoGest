import { Injectable, UnauthorizedException, ConflictException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'node:crypto';
import { eq } from 'drizzle-orm';

import { users } from '@user/infra/database/schemas/user.schema';
import { db } from '@user/infra/database/database.config';
import { Permission } from '@shared/domain/enums/permission.enum';
import { NotificationDispatchService } from './notification-dispatch.service';
import type { CreateResidentDto } from '../dto/create-resident.dto';

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private configService: ConfigService,
        private notificationDispatchService: NotificationDispatchService,
    ) { }

    private getPermissionsByRole(role: string): string[] {
        if (role === 'SINDICO') {
            return Object.values(Permission);
        }
        return [Permission.USERS_READ];
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
        if (!creatorUser || creatorUser.role !== 'SINDICO') {
            throw new ForbiddenException('Somente o síndico pode criar moradores.');
        }

        const existingUser = await db.select().from(users).where(eq(users.email, data.email));
        if (existingUser.length > 0) {
            throw new ConflictException('Este e-mail já está em uso.');
        }

        const temporaryPassword = this.generateTemporaryPassword();
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(temporaryPassword, salt);

        const [newUser] = await db.insert(users).values({
            nome: data.nome,
            email: data.email,
            senha: hashedPassword,
            role: 'MORADOR',
        }).returning({
            id: users.id,
            nome: users.nome,
            email: users.email,
            role: users.role,
        });

        this.notificationDispatchService.dispatch({
            to: newUser.email,
            channel: 'email',
            title: 'Bem-vindo ao CondoGest',
            body: `Olá, ${newUser.nome}! Sua senha temporária é: ${temporaryPassword}`,
        });

        return { user: newUser, notificationSent: true };
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
            permissions: permissions,
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
                permissions: permissions,
            },
        };
    }

    private generateTemporaryPassword(length = 10): string {
        return randomBytes(length)
            .toString('base64')
            .replace(/[^a-zA-Z0-9]/g, '')
            .slice(0, length);
    }
}
