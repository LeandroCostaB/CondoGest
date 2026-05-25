import {
    Controller,
    Post,
    Get,
    Patch,
    Delete,
    Body,
    Param,
} from '@nestjs/common';

import { MaintenanceService } from '../../application/services/maintenance.service';
import { CreateMaintenanceDto } from '../../application/dto/create-maintenance.dto';
import { UpdateMaintenanceDto } from '../../application/dto/update-maintenance.dto';
import { Public } from '../../../../shared/infra/decorators/public.decorator';

@Controller('maintenances')
export class MaintenanceController {
    constructor(
        private readonly maintenanceService: MaintenanceService,
    ) { }

    @Post()
    @Public()
    async create(@Body() dto: CreateMaintenanceDto) {
        return this.maintenanceService.create(dto);
    }

    @Get('condominium/:condominiumId')
    @Public()
    async getByCondominium(
        @Param('condominiumId') condominiumId: string,
    ) {
        return this.maintenanceService.getByCondominium(
            condominiumId,
        );
    }

    @Patch(':id')
    @Public()
    async update(
        @Param('id') id: string,
        @Body() dto: UpdateMaintenanceDto,
    ) {
        return this.maintenanceService.update(id, dto);
    }

    @Delete(':id')
    @Public()
    async delete(@Param('id') id: string) {
        return this.maintenanceService.delete(id);
    }
}