const selfsigned = require('selfsigned');
const fs = require('fs');
const path = require('path');

const attrs = [
  { name: 'commonName', value: 'NetworkNexus' },
  { name: 'organizationName', value: 'NetworkNexus' }
];

const pems = selfsigned.generate(attrs, {
  days: 365,
  keySize: 2048,
  algorithm: 'sha256'
});

fs.writeFileSync(path.join(__dirname, 'server.key'), pems.private);
fs.writeFileSync(path.join(__dirname, 'server.crt'), pems.cert);

console.log('SSL certificate generated successfully');
