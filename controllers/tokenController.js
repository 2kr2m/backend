import Token from "../models/Token.js";
import User from "../models/User.js";
export const addtoken = async (req, res) => {
    try{
        const {tokenName, tokenSymbol, tokenTotalSupply, tokenPrice, duration, RedemptionType,yieldValue, actionType} = req.body;
        const company = await User.findById(req.user._id);
        const companyAccount = await company.address;
        const token = await Token.create({
			tokenName,
			tokenSymbol,
			tokenTotalSupply,
			tokenPrice,
			companyAccount,
            duration,
			RedemptionType,
			yieldValue,
			actionType
        })
        res.status(200).json(token);
    }
    
        catch (error) {
            console.error(error);
            res.status(500).send('Error submitting data');
    
    }
}
export const addcampaigntoken= async(req,res)=>{

    try {
        const {campaignName, montant, actionType, shares, numberOfInvestors} = req.body;
        const company = await User.findById(req.user._id);
        const companyAccount = await company.address;

        const token = await Token.create({
            tokenName:campaignName,
            campaignName:campaignName,
            amount: montant,
            actionType:actionType,
            shares:shares,
            numberOfInvestors:numberOfInvestors,
            companyAccount
        })
        res.status(200).json(token);
    }
    
        catch (error) {
            console.error(error);
            res.status(500).send('Error submitting data');
    
    }
    
    
    
    };


export const mycampaign= async(req,res)=>{
        try{
            const company = await User.findById(req.user._id);
            
            const companyAccount = company.address;

            const campaignData = await Token.find({companyAccount:companyAccount});
            res.status(200).json(campaignData);
            console.log(campaignData);

        
        
        
        } catch (error) {
              console.error('Error retrieving campaign details:', error);
              res.status(500).json({ error: 'Internal Server Error' });
            }
          };
// export const mycampaign = async (req, res) => {
//     try {
//       const company = await User.findById(req.user._id);
//       const companyAccount = company.address;
  
//       // Specify the fields to include in the query projection
//       const campaignData = await Token.findOne(
//         { companyAccount: companyAccount },
//         // Fields to include (1 for inclusion, 0 for exclusion)
//         { campaignName: 1, montant: 1, actionType: 1, shares: 1, numberOfInvestors: 1, status: 1 }
//       );
  
//       res.status(200).json(campaignData);
//     } catch (error) {
//       console.error('Error retrieving campaign details:', error);
//       res.status(500).json({ error: 'Internal Server Error' });
//     }
//   };
  
