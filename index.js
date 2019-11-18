const crypto = require('crypto');
const alphaNumericalCheck = /^[a-zA-Z0-9]*$/;

module.exports = options => {
  // Provide good defaults for the options if possible.
  options = Object.assign(
    {
      fields: [],
      algorithm: 'aes-256-cbc',
      encryptionKey: '',
      ivLength: 16
    },
    options
  );

  // Return the mixin.
  return Model => {
    return class extends Model {
      async $beforeInsert(context) {
        await super.$beforeInsert(context);
        await this.encryptFields();
      }

      async $afterInsert(context) {
        await super.$afterInsert(context);
        return await this.decryptFields();
      }

      async $beforeUpdate(queryOptions, context) {
        await super.$beforeUpdate(queryOptions, context);
        await this.encryptFields();
      }

      async $afterUpdate(queryOptions, context) {
        await super.$afterInsert(queryOptions, context);
        return await this.decryptFields();
      }

      async $afterGet(context) {
        await super.$afterGet(context);
        return this.decryptFields();
      }

      /**
       * Generates encryption from selected fields
       */
      encryptFields() {
        if (options.encryptionKey)
          for (let i = 0; i < options.fields.length; i++) {
            const field = options.fields[i];
            const value = this[field];
            if (value) {
              this[field] = this.encrypt(value);
            }
          }
      }

      decryptFields() {
        if (options.encryptionKey)
          for (let i = 0; i < options.fields.length; i++) {
            const field = options.fields[i];
            const value = this[field];
            if (value) {
              this[field] = this.decrypt(value);
            }
          }
      }

      encrypt(text) {
        if (!text) return text;
        if (this.isEncrypted(text)) return text;

        let iv = crypto.randomBytes(options.ivLength);
        let cipher = crypto.createCipheriv(
          options.algorithm,
          Buffer.from(options.encryptionKey),
          iv
        );
        let encrypted = cipher.update(text);

        encrypted = Buffer.concat([encrypted, cipher.final()]);

        return iv.toString('hex') + ':' + encrypted.toString('hex');
      }

      decrypt(text) {
        if (!text) return text;
        if (!this.isEncrypted(text)) return text;

        let textParts = text.split(':');
        let iv = Buffer.from(textParts.shift(), 'hex');
        let encryptedText = Buffer.from(textParts.join(':'), 'hex');
        let decipher = crypto.createDecipheriv(
          options.algorithm,
          Buffer.from(options.encryptionKey),
          iv
        );
        let decrypted = decipher.update(encryptedText);

        decrypted = Buffer.concat([decrypted, decipher.final()]);

        return decrypted.toString();
      }

      isEncrypted(text) {
        if (!text) return false;
        let textParts = text.split(':');
        return (
          textParts.length == 2 &&
          textParts[0] &&
          textParts[1] &&
          textParts[0].length === options.ivLength * 2 &&
          alphaNumericalCheck.test(textParts[0]) &&
          alphaNumericalCheck.test(textParts[1])
        );
      }
    };
  };
};
