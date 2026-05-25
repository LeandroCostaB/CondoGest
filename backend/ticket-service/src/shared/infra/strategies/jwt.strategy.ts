import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || "1234",
    });
  }

  async validate(payload: {
    sub: string;
    email: string;
    permissions: string[];
  }) {
    // Aqui injetamos o que o seu decorador @CurrentUser espera
    return {
      sub: payload.sub,
      email: payload.email,
      permissions: payload.permissions, // As permissões vêm do Token
    };
  }
}
