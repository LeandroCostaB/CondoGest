import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix("v1");

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle("CondoGest API")
    .setDescription(
      "API para gestão condominial, com controle de usuários e condomínios. No estado atual do projeto, as rotas protegidas aceitam autenticação por headers para facilitar testes locais.",
    )
    .setVersion("1.0")
    .addApiKey(
      {
        type: "apiKey",
        in: "header",
        name: "x-user-id",
        description: "Identificador do usuário autenticado",
      },
      "x-user-id",
    )
    .addApiKey(
      {
        type: "apiKey",
        in: "header",
        name: "x-user-permissions",
        description:
          "Permissões separadas por vírgula. Se omitido, o ambiente local assume todas as permissões.",
      },
      "x-user-permissions",
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs", app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
