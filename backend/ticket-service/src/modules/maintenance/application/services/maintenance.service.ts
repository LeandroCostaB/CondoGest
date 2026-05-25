import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { eq, and } from 'drizzle-orm';

import { db } from '../../../../infra/database/database.config'; 
import { externalUsers } from '../infra/database/schemas/external-user.schema';

import { IMaintenanceRepository, MAINTENANCE_REPOSITORY } from '../../domain/repositories/maintenance-repository.interface';
import { CreateMaintenanceDto } from '../dto/create-maintenance.dto';
import { UpdateMaintenanceDto } from '../dto/update-maintenance.dto';
import { Maintenance } from '../../domain/models/maintenance.entity';

@Injectable()
export class MaintenanceService {
    constructor(
        @Inject(MAINTENANCE_REPOSITORY)
        private readonly maintenanceRepository: IMaintenanceRepository,
        
        @Inject('NOTIFICATION_SERVICE') 
        private readonly clientRabbitMQ: ClientProxy, 
    ) { }

    async create(dto: CreateMaintenanceDto): Promise<Maintenance> {
        // 1. Guarda o ticket na base de dados
        const maintenance = await this.maintenanceRepository.create(dto);

        try {
            // 2. BUSCA AUTOMÁTICA: Localiza o Síndico do condomínio
            // Aqui filtramos por role='SINDICO'. 
            // Se o seu sistema tiver múltiplos condomínios, adicione: and(eq(users.role, 'SINDICO'), eq(users.condominiumId, dto.condominiumId))
            const [sindico] = await db
                .select()
                .from(users)
                .where(eq(users.role, 'SINDICO'))
                .limit(1);

            if (sindico) {
                // 3. Verifica se o Síndico tem um Token de Push ou E-mail
                const target = sindico.fcmToken || sindico.email;
                const channel = sindico.fcmToken ? 'push' : 'email';

                if (target) {
                    this.clientRabbitMQ.emit('notification.send', {
                        to: target,
                        channel: channel,
                        title: '🛠️ Nova Manutenção Solicitada',
                        body: `O chamado "${dto.title}" foi aberto e aguarda sua revisão.`,
                        data: {
                            ticketId: maintenance.id,
                            type: 'MAINTENANCE_CREATED'
                        }
                    });
                }
            }
        } catch (error) {
            // Logamos o erro mas não travamos a criação do ticket se a notificação falhar
            console.error('[MaintenanceService] Erro ao buscar destinatário para notificação:', error);
        }

        return maintenance;
    }

    async getByCondominium(condominiumId: string): Promise<Maintenance[]> {
        return this.maintenanceRepository.findByCondominium(condominiumId);
    }
    
    async update(id: string, dto: UpdateMaintenanceDto): Promise<Maintenance> {
        const updated = await this.maintenanceRepository.update(id, dto);
        if (!updated) {
            throw new NotFoundException('Manutenção não encontrada');
        }
        return updated;
    }

    async delete(id: string): Promise<void> {
        await this.maintenanceRepository.delete(id);
    }
}