const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Urun = sequelize.define('Urun', {
    ad: {
        type: DataTypes.STRING,
        allowNull: false
    },
    aciklama: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    gorselUrl: {
        type: DataTypes.STRING,
        allowNull: true
    },
    fiyat: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    kategori: {
        type: DataTypes.STRING,
        allowNull: true
    },
    marka: {
        type: DataTypes.STRING,
        allowNull: true
    },
    stokDurumu: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    // Model ayarları
    timestamps: true, // createdAt ve updatedAt alanlarını otomatik ekler
    tableName: 'urunler' // Tablo adını belirtir
});

module.exports = Urun;
