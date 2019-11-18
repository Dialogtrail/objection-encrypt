# Automatic Field-specific encryption for Objection.js

This plugin automatically adds encryption to selected fields of your Objection models. The encryption is based on Node.js built-in Crypto.

## Installation

### NPM

`npm i objection-encrypt`

## Usage

### Encrypting your data

```js
// import the plugin
import ObjectionEncrypt from 'objection-encrypt';

// Initialize with options
var Encrypt = ObjectionEncrypt({
  fields: ['email', 'fullName'],
  encryptionKey: process.env.ENCRYPTION_KEY
});

// Add to Objection-model
class User extends Encrypt(Model) {
  static tableName = 'users';

  static jsonSchema = {
    type: 'object',
    properties: {
      id: { type: 'integer' },
      email: { type: 'string' },
      fullName: { type: 'string' }
    }
  };
}
```

The fields 'email' and 'fullName' will now be encrypted in the database. Beware that they are still vulnerable to attacks compromising the server that stores the key.

## Options

There are a few options you can pass to customize the way the plugin works.

These options can be added when instantiating the plugin. For example:

```js
// import the plugin
import ObjectionEncrypt from 'objection-encrypt';

// Initialize with options
var Encrypt = ObjectionEncrypt({
  fields: ['email', 'fullName'],
  encryptionKey: process.env.ENCRYPTION_KEY,
  algorithm: 'aes-256-cbc',
  ivLength: 16
});
```
#### `encryptionKey` (required)

The key used to encrypt and decrypt the values. Can not be easily switched out. Must be atleast 32 characters long. [Generate keys here.](http://www.unit-conversion.info/texttools/random-string-generator/)

#### `algorithm` (defaults to `'aes-256-cbc'`)

The algorithm used to encrypt the fields.

#### `ivLength` (defaults to `16`)

The length of the initialization vector.
