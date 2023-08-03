import bcrypt from 'bcryptjs';

export const passAdmin = 'token0PP2dmin';

const data = {
  users: [
    {
        
      userName: 'Administrator',
      email: 'contact@tokenopp.io',
      password: bcrypt.hashSync(passAdmin),
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