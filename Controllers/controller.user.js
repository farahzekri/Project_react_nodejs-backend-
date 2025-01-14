const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const passport = require('../Config/passport');
const User = require('../Models/user');
const asyncHandler = require('express-async-handler');
const schedule = require('node-schedule');
////////////////// Socket IO //////////////////
const Notification=require("../Models/Notification");


const registerUser = async (req, res) => {
    try {
        const { firstName, lastName, birthDate, username, email, password, gender ,active,deactivationEndTime, location, phoneNumber,accountVisibility, project,title,experience,education,role,CompanyLink,Country } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            firstName,
            lastName,
            birthDate,
            username,
            email,
            gender,
            password: hashedPassword,
            location: '',
            phoneNumber,
            title:'',
            image:'',
            active:true,
            deactivationEndTime:null,
            accountVisibility:'public',
            coverimage:'',
            experience:[],
            education:[],
            project:[],
            role,
            CompanyLink,
            Country,
        });

        await newUser.save();
       // Envoie une notification à l'administrateur
       if (role !== 'admin') {
        const adminUser = await User.findOne({ role: 'admin' });
        if (adminUser) {
            const adminId = adminUser._id; // Récupérer l'ID de l'administrateur

            const notification = new Notification({
                recipientId: adminId, // Remplacez par l'ID de l'admin
                type: 'New Compte',
                message: `User ${newUser.firstName} ${newUser.lastName} has created an account`,
            });

            await notification.save();
            console.log(notification);
        }
    }
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};



///update profil
const updateprofile = async(req,res) =>{
    try{
      
        const{firstName,lastName,birthDate,username,email,location,phoneNumber,title,accountVisibility,skills}=req.body;
        const userToUpdate = await User.findOne({ username: req.params.username });
        if (!userToUpdate) {
            return res.status(404).json({ error: 'User not found' });
        }
        userToUpdate.firstName=firstName;
        userToUpdate.lastName=lastName;
        userToUpdate.birthDate=birthDate;
        userToUpdate.username=username;
        userToUpdate.email=email;
        userToUpdate.location=location;
        userToUpdate.phoneNumber=phoneNumber;
        userToUpdate.accountVisibility=accountVisibility;
        userToUpdate.title=title;
        if (skills) {
            userToUpdate.skills = skills;
          }
        await userToUpdate.save();
        res.json({message: 'Profile updated successfully',userToUpdate});
        
        
    }catch(error){
        console.error(error);
        res.status(500).json({error:'Internal server Error'});
    }
}
// view other profil
const getinfouser = async(req,res) =>{
    try {
        const { username } = req.params;
        console.log('Username:', username);
        const userProfile = await User.findOne({ username });
    
        if (!userProfile) {
          return res.status(404).json({ message: 'User profile not found' });
        }
    
        res.json(userProfile);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
////upload photo profile 
const uploadimage= async (req,res)=>{
    const { username, imageUrl } = req.body;
    try{
        await User.findOneAndUpdate({username},{image: imageUrl});
        res.status(200).json({ message: 'Image URL saved successfully.' });
    }catch (error) {
        console.error('Error saving image URL:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
}
// modifier coverphot
const uploadcoverimage= async (req,res)=>{
    const { username, coverimageUrl } = req.body;
    try{
        await User.findOneAndUpdate({username},{coverimage: coverimageUrl});
        res.status(200).json({ message: 'Image URL saved successfully.' });
    }catch (error) {
        console.error('Error saving image URL:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
}
//desactive account  
const deactivatedaccount= async(req,res)=>{
    const {username,duration,password}=req.body;
    

           
    if (!username ) {
        return res.status(400).json({ error: "Missing username" });
    }
    try {

        const user = await User.findOne({ username: username });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const isPasswordValid = await user.isValidPassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        if (duration === '1' || duration === '24' || duration === '48') {
            deactivationEndTime = new Date(Date.now() + parseInt(duration)  * 60 * 1000);
            user.active = false;
            user.deactivationEndTime = deactivationEndTime;
            await user.save();
            scheduleReactivation(user, deactivationEndTime);
            return res.status(200).json({ message: `Account disabled for${duration} heures`, user });
         }else if (duration === 'deactivate the account forever') {
            user.active = false;
            user.deactivationEndTime = null;
            await user.save();
            return res.status(200).json({ message: "Account disabled indefinitely", user });
        } else if (!isNaN(parseInt(duration))) {
            const deactivationEndTime = new Date(Date.now() + parseInt(duration) * 60 * 1000);
            user.active = false;
            user.deactivationEndTime = deactivationEndTime;
            await user.save();
            scheduleReactivation(user, deactivationEndTime);
            return res.status(200).json({ message: `Account disabled for${duration} heures`, user });
        } else {
            return res.status(400).json({ error: "Invalid deactivation duration" });
        }
    } catch (error) {
        console.error("Error finding user:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
} 
function scheduleReactivation(user, deactivationEndTime) {
    schedule.scheduleJob(deactivationEndTime, async () => {
        user.active = true;
        user.deactivationEndTime = null;
        await user.save();
        console.log(`Le compte de l'utilisateur ${user.username} a été réactivé.`);
    });
}
const getimagbyapp =async (req,res) =>{
    try{
        const username = req.body.username; 
        const userfo=await User.findOne({ username: username });
        if(!userfo){
            return res.status(404).json({message:'job offer not found'});
         }
         const image=userfo.image;
         res.json(image);
    }catch (err){
        res.status(500).json({ message: 'Internal server error' });
    }
}
const getUserById = async (req, res) => {
    const userId = req.query.userId;
    const username = req.query.username;
    try {
        let user;
        if (userId) {
            user = await User.findById(userId);
        } else if (username) {
            user = await User.findOne({ username: username });
        } else {
            throw new Error('Neither userId nor username provided');
        }

        if (!user) {
            throw new Error('User not found');
        }

        const { password, firstName, ...other } = user._doc;
        res.status(200).json(other);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}


const getUsersByUserId = async (req, res) => {
    const userId = req.params.userId; // Récupérez l'ID de l'utilisateur depuis les paramètres de la requête
    try {
        // Recherchez tous les utilisateurs dont l'ID n'est pas égal à l'ID spécifié et qui n'ont pas le rôle "admin"
        const users = await User.find({ _id: { $ne: userId }, role: { $ne: 'admin' } });

        // Vérifiez si des utilisateurs ont été trouvés
        if (!users || users.length === 0) {
            return res.status(404).json({ error: 'No users found' });
        }

        // Renvoyez les détails des utilisateurs trouvés
        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}




const getAllUsers = async (req, res) => {
    try {
        const users = await User.find(); 
        res.json(users); 
    } catch (err) {
        res.status(500).json({ message: 'Internal server error' });
    }
}
const getOneUserById = async (req, res) => {
    const userId = req.params.userId; // Récupérez l'ID de l'utilisateur depuis les paramètres de la requête
    try {
        // Recherchez l'utilisateur par son ID
        const user = await User.findById(userId);

        // Vérifiez si l'utilisateur a été trouvé
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Renvoyez les détails de l'utilisateur trouvé
        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


module.exports = {
    registerUser,
    updateprofile,
    getinfouser,
    uploadimage,
    uploadcoverimage,
    deactivatedaccount,
    getimagbyapp,
    getUserById,
    getUsersByUserId,
    getAllUsers,
    getOneUserById      
};