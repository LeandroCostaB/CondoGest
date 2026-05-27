import { bootstrapHttpApp } from "@shared/infra/http/bootstrap-http-app";
import { AppModule } from "./app.module";

void bootstrapHttpApp(AppModule, {
  title: "CondoGest Notification API",
  description: "Microsserviço de notificações — consome eventos e envia alertas.",
  port: process.env.PORT,
});
