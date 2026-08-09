const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    let token = req.headers['authorization'];
    if (token && token.startsWith('Bearer ')) {
        token = token.slice(7, token.length);
    } else {
        token = req.headers['x-auth-token'];
    }

    if (!token) {
        return res.status(401).json({ mesaj: 'Yetkisiz erişim. Lütfen giriş yapın.' });
    }

    try {
        // Token'ı doğrula
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // İsteğe kullanıcı bilgisini ekle
        next(); // Token geçerli, devam et
    } catch (error) {
        return res.status(401).json({ mesaj: 'Geçersiz veya süresi dolmuş token.' });
    }
};

module.exports = authMiddleware;
