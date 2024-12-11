
import jwt from 'jsonwebtoken';
import db from '../config/db.js';  
export const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; 

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.error('Token verification failed:', err);
            return res.status(401).json({ message: 'Invalid token.' });
        }

        console.log('Decoded token:', decoded); 

        // Attaching user_id to the request object
        req.user_id = decoded.userId; 


        const query = 'SELECT role_id FROM Users WHERE user_id = ? AND is_deleted = FALSE';
    

        db.query(query, [decoded.userId], (err, result) => {
            if (err) {
                console.error('Error fetching role:', err);
                return res.status(500).json({ message: 'Internal server error.' });
            }

            if (result.length === 0) {
                console.error('No user found with this ID or user is inactive');
                return res.status(404).json({ message: 'User not found or inactive.' });
            }

            
            req.role_id = result[0].role_id;
            next();
        });
    });
};


export const verifyRole = (...allowedRoles) => {
    return (req, res, next) => {        
        if (!req.role_id) {
            return res.status(403).json({ message: 'Role not found. Access denied.' });
        }

        if (!allowedRoles.includes(req.role_id)) {
            return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
        }
        
        next(); 
    };
};

