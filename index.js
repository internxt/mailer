"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailerBuilder = MailerBuilder;
var path_1 = __importDefault(require("path"));
var fs_1 = __importDefault(require("fs"));
var assert_1 = __importDefault(require("assert"));
var handlebars_1 = __importDefault(require("handlebars"));
var mail_1 = __importDefault(require("@sendgrid/mail"));
var Mailer = /** @class */ (function () {
    function Mailer(options) {
        options = options || {};
        if (!options.sendgrid || !options.sendgrid.api_key) {
            assert_1.default.ok(options.host, 'No SMTP host supplied');
            assert_1.default.ok(options.port, 'No SMTP port supplied');
        }
        if (options.sendgrid && options.sendgrid.api_key) {
            mail_1.default.setApiKey(options.sendgrid.api_key);
        }
        this.options = options;
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
    Mailer.prototype.dispatchSendGrid = function (email, template, context, callback) {
        var _this = this;
        var done = callback || function () { };
        if (!this.options || !this.options.sendgrid || !this.options.sendgrid.api_key) {
            return callback(new Error('No SendGrid API Key provided'));
        }
        this.getTemplate(template, function (err, template) {
            if (err) {
                return done(err);
            }
            var compiled = template(context);
            var mailparams = {
                to: email,
                from: _this.options.from,
                subject: compiled.subject,
                html: compiled.markup,
                text: compiled.plaintext
            };
            mail_1.default.send(mailparams).then(function () {
                callback();
            }).catch(function (err) {
                callback(err);
            });
        });
    };
    /**
     * Loads and compiles the mail template
     * #getTemplate
     * @param {String} name
     * @param {Function} callback
     */
    Mailer.prototype.getTemplate = function (name, callback) {
        var _this = this;
        assert_1.default.ok(name, 'No template name was supplied');
        var loaders = [this.getSubject, this.getMarkup, this.getPlaintext].map(function (loader) {
            return new Promise(function (resolve, reject) {
                loader.call(_this, name, function (err, template) {
                    err ? reject(err) : resolve(template);
                });
            });
        });
        Promise.all(loaders).then(function (results) {
            callback(null, function render(data) {
                data = data || {};
                return {
                    subject: results[0](data),
                    markup: results[1](data),
                    plaintext: results[2](data)
                };
            });
        }, function (err) { return callback(err); });
    };
    ;
    /**
     * Helper for loading email template subject
     * #_getSubject
     * @param {String} name
     * @param {Function} callback
     */
    Mailer.prototype.getSubject = function (name, callback) {
        this.getTemplateResource([[name, name].join('/'), 'subject'].join('.'), callback);
    };
    ;
    /**
     * Helper for loading email template markup
     * #_getMarkup
     * @param {String} name
     * @param {Function} callback
     */
    Mailer.prototype.getMarkup = function (name, callback) {
        this.getTemplateResource([[name, name].join('/'), 'html'].join('.'), callback);
    };
    ;
    /**
     * Helper for loading email template plaintext
     * #_getPlaintext
     * @param {String} name
     * @param {Function} callback
     */
    Mailer.prototype.getPlaintext = function (name, callback) {
        this.getTemplateResource([[name, name].join('/'), 'txt'].join('.'), callback);
    };
    ;
    /**
     * Helper for loading email template resource
     * #__getTemplateResource
     * @param {String} filename
     * @param {Function} callback
     */
    Mailer.prototype.getTemplateResource = function (filename, callback) {
        fs_1.default.exists(path_1.default.join(__dirname, 'templates', filename), function (exists) {
            if (!exists) {
                return callback(new Error('Resource "' + filename + '" does not exist'));
            }
            fs_1.default.readFile(path_1.default.join(__dirname, 'templates', filename), function (err, contents) {
                if (err) {
                    return callback(err);
                }
                callback(null, handlebars_1.default.compile(contents.toString()));
            });
        });
    };
    ;
    return Mailer;
}());
function MailerBuilder(options) {
    return new Mailer(options);
}
exports.default = Mailer;
module.exports = Mailer;
