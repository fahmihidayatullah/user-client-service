const bcrypt = require('bcryptjs');
const db = require('../../component/db');
const User = db.User;
const Client = db.Client;
const request = require('request');
const objectID = require('mongodb').ObjectID
const nodemailer = require('nodemailer');
const provision_key = process.env.PROVISION_KEY;
const provision_key_reset = process.env.PROVISION_KEY_RESET;
const KONG_API= process.env.KONG_API;
const API_PATH= process.env.API_PATH;
const grant_type = "password";
module.exports = {
    login,
    forgetPass,
    resetPass,
    forgetUser,
    getAll,
    getData,
    getById,
    getByClientId,
    create,
    update,
    changePass,
    delete: _delete
};

async function login(username, password, callback) {
    let data = {}
    let temp = "";
    const user = await User.findOne({ username });
    if (user && bcrypt.compareSync(password, user.hash)) {
        const client = await Client.findOne({ _id: user.clientId });
        if (!client) { 
            data = {
                error: "client not found"
            }
            callback(data);
        } 
        else {
            process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
            request({
                method: "POST",
                url: KONG_API + API_PATH + "/oauth2/token",
                form: {
                    client_id: client.clientuid,
                    client_secret: client.clientsecret,
                    scope: user.scope,
                    grant_type: grant_type,
                    provision_key: provision_key,
                    authenticated_userid: user.id,
                    username: username,
                    password: password
                }
            }, function(error, response, body) {
                try{ 
                    temp = JSON.parse(body);
                    if (!temp.error){
                        data = { 
                            refresh_token: temp.refresh_token, 
                            access_token: temp.access_token,
                            token_type: temp.token_type,
                            expires_in: temp.expires_in,
                            scope: user.scope, 
                            client_id: user.clientId, 
                            userid: user.id,
                            name: user.firstName
                        }
                    } else {
                        data = {
                            error: temp.error,
                            username: username
                        }
                    }
                } catch (err){
                    data = {
                        error: "Login Failed",
                        username: username
                    }
                }
                callback(data);
            });
        }
    } else {
        data = {
            error: "User not found, username or password is incorrect"
        }
        callback(data);
    }
}

async function forgetPass(username, email, no_hp, callback) {
    const user = await User.findOne({ username: username });
    let data = {}
    let temp = "";
    if (user && user.no_hp == no_hp && user.email == email) {
        const client = await Client.findOne({ _id: user.clientId });
        if (!client) { 
            data = {
                error: "client not found"
            }
            callback(data);
        }
        else {
            process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
            request({
                method: "POST",
                url: KONG_API + API_PATH + "/reset_password/oauth2/token",
                headers: {
                Host: "localhost"
                },
                form: {
                    client_id: client.clientuid,
                    client_secret: client.clientsecret,
                    scope: user.scope,
                    grant_type: grant_type,
                    provision_key: provision_key_reset,
                    authenticated_userid: user.id,
                    username: username,
                    password: email
                }
            }, function(error, response, body) {
                temp = JSON.parse(body);
                if (!temp.error){
                    data = { 
                        reset_token: temp.access_token,
                        expires_in: temp.expires_in,
                        username: username
                    }
                } else {
                    data = {
                        error: temp.error,
                        username: username
                    }
                }
                callback(data);
            });
        }
    } else {
        data = {
            error: "User not found, email or no_hp is incorrect!"
        }
        callback(data);
    }
}

async function resetPass(clientId, id_header, userParam) {
    if (!objectID.isValid(clientId) || !objectID.isValid(id_header)) throw 'The reset token is invalid';
    const user = await User.findOne({ username: userParam.username, clientId: clientId });

    if (!user) throw 'User Not Found';
    if (!userParam.password) throw 'Password is required';
    if (user.id !== id_header) throw 'Username is incorrect'

    userParam.hash = bcrypt.hashSync(userParam.password, 10);

    Object.assign(user, userParam);
    await user.save();
}

async function forgetUser(email, no_hp) {
    const subject = process.env.PLATFORM_NAME + " System";
    let prefix = "Hi, It seems you forgot your username, here’s we send your username to remind you.<br><br>";
    let postfix = "Best Regards,<br>Support Team<br><br><br>NOTE: This email was automatically generated from " + subject + " System.<br>Please delete this email immediately!"
    if(!email || !no_hp) throw 'Please check your body, email or No HP is missing'
    const user = await User.find({ email: email, no_hp: no_hp }).select('username scope');
    if (user.length===0) throw 'User Not Found';
    let ListUsername = "";
    for (let it = 1; it <= user.length; it++) {
        ListUsername = ListUsername + it + ". Username: <b>" + user[it-1].username + "</b> as " + user[it-1].scope + "<br>";
    }
    ListUsername = ListUsername + "<br>Please use your username and password to login, Thank You.<br><br><br><br>";
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false, 
        requireTLS: true,
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD 
        }
    });

    const mailOptions = {
        from: process.env.SMTP_EMAIL,  
        to: email,
        subject: subject + " - Forgot Username" , 
        html: prefix + ListUsername + postfix
      };
    return await transporter.sendMail(mailOptions);
}

async function getAll(clientId, scope) {
    if (!objectID.isValid(clientId)) throw 'Invalid Client ID';
    if (scope === "superadmin"){
        return await User.find().select('-hash');
    } else {
        return await User.find({clientId: clientId}).select('-hash');
    }
}

async function getData(clientId, username, query) {
    if(!objectID.isValid(clientId)) throw 'Invalid Client ID';
    const conditions = ["fcmkeys", "no_hp", "email"];
    if(!conditions.some(el => query.includes(el))) throw 'Parameters are not permitted';
    if (username !== ""){
        return await User.findOne({ username: username, clientId: clientId }).select(query);
    } else {
        return await User.find({ clientId: clientId }).select(query);
    }
}

async function getById(id) {
    if(!objectID.isValid(id)) throw 'Invalid ID';
    return await User.findById(id).select('-hash');
}

async function getByClientId(clientId) {
    if(!objectID.isValid(clientId)) throw 'Invalid ID client';
    return await User.find({ clientId: clientId }).select('-hash');
}

async function create(userParam) {
    if (await User.findOne({ username: userParam.username, clientId: userParam.clientId })) {
        throw 'Username "' + userParam.username + '" is already taken in client ' + userParam.clientId;
    }

    const user = new User(userParam);
    if (userParam.password) {
        user.hash = bcrypt.hashSync(userParam.password, 10);
    } else {
        user.hash = bcrypt.hashSync("DefaultPass123", 10);
    }

    await user.save();
}

async function update(id, userParam) {
    if(!objectID.isValid(id)) throw 'Invalid ID';
    const user = await User.findById(id);

    if (!user) throw 'User Not Found';
    if (userParam.password) throw "Can't Change Password with this method";
    const client_id = userParam.clientId || user.clientId;
    if (user.username !== userParam.username && await User.findOne({ username: userParam.username, clientId: client_id })) {
        throw 'Username "' + userParam.username + '" is already taken in client ' + client_id;
    }

    Object.assign(user, userParam);
    await user.save();
}

async function changePass(id, userParam) {
    if(!objectID.isValid(id)) throw 'Invalid ID';
    const user = await User.findById(id);

    if (!user) throw 'User Not Found';
    if (!userParam.old_password || !userParam.new_password) throw 'Old Password and New Password are required';
    if (!bcrypt.compareSync(userParam.old_password, user.hash)) throw 'Incorrect Password';
    userParam.hash = bcrypt.hashSync(userParam.new_password, 10);
    Object.assign(user, userParam);
    await user.save();
}

async function _delete(id) {
    if(!objectID.isValid(id)) throw 'Invalid ID';
    await User.findByIdAndRemove(id);
}
