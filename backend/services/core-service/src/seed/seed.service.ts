import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import { sql } from "drizzle-orm";
import { DrizzleService } from "@shared/infra/database/drizzle.service";
import { usersSchema } from "@users/infra/database/schemas/user.schema";
import { condominiumsSchema } from "@condominiums/infra/database/schemas/condominium.schema";
import { apartmentsSchema } from "@apartments/infra/database/schemas/apartment.schema";

const SENHA_HASH_SINDICO = "$2b$10$ee3qjOOFb2ItCGW1jPWDKu.nARfjIlPCUA2rWupisKq.PJsklbmfa";
const SENHA_HASH         = "$2b$10$wvAjPb/1NIbi2DiYXTMEI.KEZQNN2EelX.B.ru8NvajmvLchEdCTu";

const SINDICO_ID  = "f9714ea4-6c37-434f-87b3-1bacab49002e";
const JOAO_ID     = "24b8e62f-4c7a-4481-b07c-329664c9e194";
const MARIA_ID    = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
const CONDO_ID    = "fe8692cb-8a62-4d2a-909b-124d60dac753";
const APT_101A_ID = "a9dd0e45-dbfb-4b34-a41e-3d12cfb1f1ce";
const APT_201A_ID = "b2c3d4e5-f6a7-8901-bcde-f12345678901";
const APT_102B_ID = "c3d4e5f6-a7b8-9012-cdef-012345678902";
const APT_202B_ID = "d4e5f6a7-b8c9-0123-def0-123456789012";

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(private readonly drizzle: DrizzleService) {}

  async onApplicationBootstrap(): Promise<void> {
    if (process.env.SEED_DB !== "true") return;

    const [{ count }] = await this.drizzle.db
      .select({ count: sql<number>`count(*)::int` })
      .from(usersSchema);

    if (count > 0) {
      this.logger.log("Seed ignorado: banco já possui dados.");
      return;
    }

    this.logger.log("Populando banco de dados com dados iniciais...");
    await this.seedUsers();
    await this.seedCondominiums();
    await this.seedApartments();
    this.logger.log("Seed concluído com sucesso.");
  }

  private async seedUsers(): Promise<void> {
    const now = new Date();
    await this.drizzle.db.insert(usersSchema).values([
      { id: SINDICO_ID, nome: "Admin Síndico",  email: "sindico@condogest.com", senha: SENHA_HASH_SINDICO, role: "SINDICO", createdAt: now, updatedAt: now },
      { id: JOAO_ID,    nome: "João Morador",   email: "joao@condogest.com",    senha: SENHA_HASH,         role: "MORADOR", createdAt: now, updatedAt: now },
      { id: MARIA_ID,   nome: "Maria Moradora", email: "maria@condogest.com",   senha: SENHA_HASH,         role: "MORADOR", createdAt: now, updatedAt: now },
    ]).onConflictDoNothing();
    this.logger.log("  ✓ Usuários inseridos (3) — senha: senha123");
  }

  private async seedCondominiums(): Promise<void> {
    const now = new Date();
    await this.drizzle.db.insert(condominiumsSchema).values([
      { id: CONDO_ID, name: "Residencial Aurora", address: "Rua das Flores, 100 - Vila Madalena - São Paulo/SP", userId: SINDICO_ID, status: "active", createdAt: now, updatedAt: now },
    ]).onConflictDoNothing();
    this.logger.log("  ✓ Condomínios inseridos (1)");
  }

  private async seedApartments(): Promise<void> {
    const now = new Date();
    await this.drizzle.db.insert(apartmentsSchema).values([
      { id: APT_101A_ID, number: "101", block: "A", floor: 1, condominiumId: CONDO_ID, userId: JOAO_ID,  createdAt: now, updatedAt: now },
      { id: APT_201A_ID, number: "201", block: "A", floor: 2, condominiumId: CONDO_ID, userId: null,     createdAt: now, updatedAt: now },
      { id: APT_102B_ID, number: "102", block: "B", floor: 1, condominiumId: CONDO_ID, userId: MARIA_ID, createdAt: now, updatedAt: now },
      { id: APT_202B_ID, number: "202", block: "B", floor: 2, condominiumId: CONDO_ID, userId: null,     createdAt: now, updatedAt: now },
    ]).onConflictDoNothing();
    this.logger.log("  ✓ Apartamentos inseridos (4)");
  }
}
