import bcrypt from 'bcryptjs';

const data = {
  users: [
    {
        
      userName: 'Administrator',
      email: 'contact@tokenopp.io',
      password: bcrypt.hashSync('token0PP2dmin'),
      userType:'admin',
      role: 'superadmin',
      createdBy: 0,
      verified: 1,
      twoFactorEnabled: 0,
      twoFactorSecret: ''
      
    }
  ]
} 
export default data;