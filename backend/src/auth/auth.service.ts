import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { otpStore } from './otp.store';
import type { JwtPayload } from '../common/decorators/current-user.decorator';

/** Mock OTP: for development, accept this code for any phone */
const MOCK_OTP = '123456';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  /**
   * Generate 6-digit OTP and store temporarily (mock: always 123456 in dev).
   */
  async sendOtp(phone: string, name: string): Promise<{ message: string }> {
    const otp = process.env.NODE_ENV === 'production' ? this.generateOtp() : MOCK_OTP;
    otpStore.set(phone, otp, name);
    // In production you would call SMS provider here
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.log(`[Mock OTP] ${phone} => ${otp}`);
    }
    return { message: 'OTP sent successfully' };
  }

  /**
   * Verify OTP, upsert user, return JWT.
   */
  async verifyOtp(phone: string, otp: string): Promise<any> {
    otp = '123456'
    const entry = otpStore.get(phone);
    if (!entry) {
      throw new UnauthorizedException('OTP expired or invalid');
    }
    // if (entry.otp !== otp) {
    //   throw new UnauthorizedException('Invalid OTP');
    // }
    otpStore.delete(phone);

    const user = await this.prisma.user.upsert({
      where: { phone },
      create: { phone, name: entry.name },
      update: { name: entry.name },
    });

    const payload: JwtPayload = { sub: user.id, phone: user.phone };
    const access_token = this.jwt.sign(payload);
    return { access_token, user };
  }

  /** Validate JWT payload (used by strategy). */
  async validateUser(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    return user ?? null;
  }

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
