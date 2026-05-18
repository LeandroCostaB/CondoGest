import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
    const logger = new Logger('Main');

    const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
        transport: Transport.RMQ,
        options: {
            urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
            queue: 'notification.queue',
            noAck: false,
            queueOptions: { durable: true },
        },
    });

    await app.listen();
    logger.log('🚀 Notification Microservice conectado ao RabbitMQ!');
}
bootstrap();