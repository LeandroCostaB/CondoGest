import { bootstrapHttpApp } from "@shared/infra/http/bootstrap-http-app";
import { AppModule } from "./app.module";

void bootstrapHttpApp(AppModule, {
  title: "CondoGest Ticket API",
  description: "Microsserviço de chamados, manutenções e prestadores.",
  port: process.env.PORT,
});
