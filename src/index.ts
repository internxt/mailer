import path from 'path';
import fs from 'fs';
import async from 'async';
import assert from 'assert';
import nodemailer from 'nodemailer';
import handlebars from 'handlebars';
import sgMail from '@sendgrid/mail'
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { ContextName } from './context';

interface MailerOptions extends Omit<SMTPTransport.Options, 'from'> {
  sendgrid: {
    api_key: string
  },
  from: string
}

class Mailer {
  private options: MailerOptions;
  private transporter: nodemailer.Transporter;

  constructor(options: MailerOptions) {
    options = options || {};

    if (!options.sendgrid || !options.sendgrid.api_key) {
      assert.ok(options.host, 'No SMTP host supplied');
      assert.ok(options.port, 'No SMTP port supplied');
    }

    if (options.sendgrid && options.sendgrid.api_key) {
      sgMail.setApiKey(options.sendgrid.api_key);
    }

    this.options = options;
    this.transporter = nodemailer.createTransport(options);
  }

  /**
   * Sends the email template to the specified address
   * using SMTP protocol
   * #dispatch
   * @param {String} email
   * @param {String} template
   * @param {Object} context
   * @param {Function} callback
   */
  dispatch(email: string, template: ContextName, context: any, callback: any) {
    const done = callback || function () { };

    this.getTemplate(template, (err, template) => {
      if (err) {
        return done(err);
      }

      let compiled = template(context);
      let mailparams: any = {
        to: email,
        from: this.options.from,
        subject: compiled.subject,
        html: compiled.markup,
        text: compiled.plaintext
      };

      this.transporter.sendMail(mailparams, done);
    });
  }

  /**
 * Sends the email template to the specified address,
 * using SendGrid API
 * #dispatch
 * @param {String} email
 * @param {String} template
 * @param {Object} context
 * @param {Function} callback
 */
  dispatchSendGrid(email: string, template: ContextName, context: any, callback: (err?: Error) => void) {
    var done = callback || function () { };

    if (!this.options || !this.options.sendgrid || !this.options.sendgrid.api_key) {
      return callback(new Error('No SendGrid API Key provided'));
    }

    this.getTemplate(template, (err, template) => {
      if (err) {
        return done(err);
      }

      let compiled = template(context);

      let mailparams: any = {
        to: email,
        from: this.options.from,
        subject: compiled.subject,
        html: compiled.markup,
        text: compiled.plaintext
      };

      sgMail.send(mailparams).then(function () {
        callback()
      }).catch(function (err) {
        callback(err);
      })
    });
  }

  /**
   * Loads and compiles the mail template
   * #getTemplate
   * @param {String} name
   * @param {Function} callback
   */
  getTemplate(name: string, callback: (err: Error | null, template?: any) => void) {
    assert.ok(name, 'No template name was supplied');

    const stack: ((callback: any) => void)[] = [
      this.getSubject.bind(this, name),
      this.getMarkup.bind(this, name),
      this.getPlaintext.bind(this, name)
    ];

    async.parallel<(callback: any) => void>(stack, function (err, results: any) {
      if (err) {
        return callback(err);
      }

      callback(null, function render(data: any) {
        data = data || {};

        return {
          subject: results[0](data),
          markup: results[1](data),
          plaintext: results[2](data)
        };
      });
    });
  };

  /**
   * Helper for loading email template subject
   * #_getSubject
   * @param {String} name
   * @param {Function} callback
   */
  private getSubject(name: string, callback: any) {
    this.getTemplateResource([[name, name].join('/'), 'subject'].join('.'), callback);
  };

  /**
   * Helper for loading email template markup
   * #_getMarkup
   * @param {String} name
   * @param {Function} callback
   */
  private getMarkup(name: string, callback: any) {
    this.getTemplateResource([[name, name].join('/'), 'html'].join('.'), callback);
  };

  /**
   * Helper for loading email template plaintext
   * #_getPlaintext
   * @param {String} name
   * @param {Function} callback
   */
  private getPlaintext(name: string, callback: any) {
    this.getTemplateResource([[name, name].join('/'), 'txt'].join('.'), callback);
  };


  /**
   * Helper for loading email template resource
   * #__getTemplateResource
   * @param {String} filename
   * @param {Function} callback
   */
  private getTemplateResource(filename: string, callback: (err: Error | null, template?: HandlebarsTemplateDelegate<any>) => void) {
    fs.exists(path.join(__dirname, 'templates', filename), function (exists) {
      if (!exists) {
        return callback(new Error('Resource "' + filename + '" does not exist'));
      }

      fs.readFile(
        path.join(__dirname, 'templates', filename),
        function (err, contents) {
          if (err) {
            return callback(err);
          }

          callback(null, handlebars.compile<any>(contents.toString()));
        }
      );
    });
  };

}

export function MailerBuilder(options: MailerOptions) {
  return new Mailer(options);
}

export default Mailer;
module.exports = Mailer;