import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import * as nodemailer from 'nodemailer';
import * as hbs from 'nodemailer-express-handlebars';
import { CommonService } from 'src/common-service/common.service';

@Injectable()
export class EmailService {
  private transporter: any = null;
  private readonly logger = new Logger(EmailService.name);

  constructor(
    @InjectQueue('sendMail')
    private mailQueue: Queue, // private readonly commonService: CommonService,
  ) {}

  public async sendMailFrac(mail: Mail): Promise<boolean> {
    try {
      this.logger.log('sent mail: ', mail.template);
      this.mailQueue.add(
        'sendmail',
        { mail },
        { attempts: 5, backoff: 2000, timeout: 30000, removeOnComplete: true },
      );
      return true;
    } catch (err) {
      this.logger.log('Error send mail: ' + err);
      return false;
    }
  }

  public async sendEmail(mail: Mail, jobId: any) {
    this.transporter = nodemailer.createTransport({
      service: process.env.MAIL_SERVICE,
      host: process.env.MAIL_HOST,
      port: +process.env.MAIL_PORT,
      secure: true,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
      },
      pool: true,
    });

    const mailOption = {
      from: {
        name: mail.fromEmail,
        address: process.env.MAIL_FROM,
      },
      to: mail.toEmail,
      subject: mail.subject,
      attachments: [],
      template: mail.template,
      context: mail.context,
      replyTo: mail.replyTo,
    };

    this.transporter.use(
      'compile',
      hbs({
        viewEngine: {
          extname: '.hbs',
          partialsDir: '/src/services/email/mail-templates',
          layoutsDir:
            process.cwd() + `/src/services/email/mail-templates/${mail.dir}`,
          defaultLayout: mail.template,
        },
        viewPath: 'src/services/email/mail-templates/' + mail.dir,
        extName: '.hbs',
      }),
    );

    await this.send(mailOption, jobId, this.transporter, this.logger);
  }

  private send(mailOptions, jobId, transporter, logger) {
    return new Promise(function (resolve, reject) {
      transporter.sendMail(mailOptions, async (err, info) => {
        if (err) {
          logger.error('Email Sending Error...:::');
          logger.error(err);
          reject(err);
        } else {
          logger.log(`Email Sent Successfully:: ${jobId}`);
          resolve(info);
        }
      });
    });
  }
}

export class Mail {
  fromEmail: string;
  toEmail: string | string[];
  subject: string;
  context: object;
  dir: string;
  template: string;
  replyTo: string;

  constructor(
    fromEmail: string,
    toEmail: string | string[],
    subject: string,
    context: object,
    dir: string,
    template: string,
    replyTo: string,
  ) {
    this.fromEmail = fromEmail;
    this.toEmail = toEmail;
    this.subject = subject;
    this.context = context;
    this.dir = dir;
    this.template = template;
    this.replyTo = replyTo;
  }
}
