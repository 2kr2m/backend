import mailjet from 'node-mailjet';
import dotenv from "dotenv";
dotenv.config();
const mailjetClient = mailjet.apiConnect(process.env.API_KEY,process.env.SECRET_KEY );

export const sendEmail = async (email,name, subject, text) => {
    try {
 

  const request = mailjetClient
  .post('send', { version: 'v3.1' })
  .request({
    Messages: [
      {
        From: {
          Email: 'hello@tokenopp.io',
          Name: 'contact',
        },
        To: [
          {
            Email: email,
            Name: name,
          },
        ],
        Subject: subject,
        HTMLPart: text,
      },
    ],
  });

request
  .then((result) => {
    console.log(result.body);

  })
  .catch((error) => {
    console.error(error);
   
  });


    } catch (error) {
        console.log(error, "email not sent");
    }
};