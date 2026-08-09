const { Sequelize } = require('sequelize');
const path = require('path');

let sequelize;

if (process.env.DATABASE_URL) {
  // Ortam değişkeni olarak DATABASE_URL tanımlıysa PostgreSQL kullan
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres', // PostgreSQL dialektini belirtmek iyi bir pratik
    protocol: 'postgres', // Protokolü belirtmek
    dialectOptions: {
      ssl: {
        require: true, // SSL bağlantısı gerektir
        rejectUnauthorized: false // Render gibi platformlarda sertifika doğrulamayı kapatmak gerekebilir
      }
    },
    logging: false // SQL sorgularının konsola yazılmasını kapatır
  });
} else {
  // Geliştirme ortamı için SQLite kullan
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../rana_klinik.sqlite'),
    logging: false
  });
}

module.exports = sequelize;