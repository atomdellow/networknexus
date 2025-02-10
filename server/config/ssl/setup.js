const selfsigned = require('selfsigned');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');

const SSL_CONFIG = {
  keyPath: path.join(__dirname, 'server.key'),
  certPath: path.join(__dirname, 'server.crt'),
  days: 365,
  keySize: 2048,
  algorithm: 'sha256'
};

function generateCertificate() {
  const attrs = [
    { name: 'commonName', value: process.env.DOMAIN || 'networknexus.local' },
    { name: 'organizationName', value: 'NetworkNexus' },
    { name: 'organizationalUnitName', value: 'Security' }
  ];

  const pems = selfsigned.generate(attrs, {
    days: SSL_CONFIG.days,
    keySize: SSL_CONFIG.keySize,
    algorithm: SSL_CONFIG.algorithm,
    extensions: [{
      name: 'basicConstraints',
      cA: true
    }, {
      name: 'keyUsage',
      keyCertSign: true,
      digitalSignature: true,
      nonRepudiation: true,
      keyEncipherment: true,
      dataEncipherment: true
    }]
  });

  fs.writeFileSync(SSL_CONFIG.keyPath, pems.private);
  fs.writeFileSync(SSL_CONFIG.certPath, pems.cert);

  console.log('SSL certificate generated successfully');
  return pems;
}

// Schedule certificate renewal
cron.schedule('0 0 1 * *', () => {
  console.log('Checking SSL certificate expiration...');
  const certExists = fs.existsSync(SSL_CONFIG.certPath);
  if (!certExists) {
    generateCertificate();
    return;
  }

  const cert = fs.readFileSync(SSL_CONFIG.certPath);
  const certInfo = new (require('asn1.js').define('Certificate'))();
  const expiry = certInfo.decode(cert, 'der').tbsCertificate.validity.notAfter.value;

  if (new Date(expiry) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)) {
    console.log('Certificate expires soon, generating new one...');
    generateCertificate();
  }
});

// Initial setup
if (!fs.existsSync(SSL_CONFIG.certPath)) {
  generateCertificate();
}

module.exports = {
  generateCertificate,
  SSL_CONFIG
};
