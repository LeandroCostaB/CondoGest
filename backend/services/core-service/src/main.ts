import { bootstrapHttpApp } from "@shared/infra/http/bootstrap-http-app";
import { AppModule } from "./app.module";

void bootstrapHttpApp(AppModule, {
  title: "CondoGest Core API",
  description: "Microsserviço de autenticação, usuários, condomínios e apartamentos.",
  port: process.env.PORT,
});
