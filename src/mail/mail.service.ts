import { Injectable, Inject } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from "nodemailer";

import { User } from "src/users/entities/user.entity";

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  constructor(private configService: ConfigService) {
    const user = this.configService.get<string>("BREVO_USER");
    const pass = this.configService.get<string>("BREVO_PASS");
    this.transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,
      secure: false,
      auth: {
        user,
        pass,
      },
    });
  }

  async sendTransactionalEmail(user: User, subject: string, html: string) {
    try {
      const info = await this.transporter.sendMail({
        from: '"xpay" <no-reply@xpay.com>',
        to: user.email,
        subject,
        html,
      });
      console.log("Email sent:", info.response);
    } catch (error) {
      throw error;
    }
  }
}
