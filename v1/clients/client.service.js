const db = require('../../component/db');
const Client = db.Client;
const objectID = require('mongodb').ObjectID
const request = require('request-promise');

module.exports = {
    getAll,
    getById,
    create,
    update,
    delete: _delete
};

async function getAll(callback) {
    const client = await Client.find();
    if (!client.length) {callback (null)} else {
        callback(client);
    }
}

async function getById(id) {
    if(!objectID.isValid(id)) throw 'Invalid ID';
    return await Client.findById(id);
}

async function create(clientParam) {
    if (await Client.findOne({ clientname: clientParam.clientname })) {
        throw 'clientname "' + clientParam.clientname + '" is already taken';
    }

    const client = new Client(clientParam);
    client._id = clientParam._id || new objectID();
    const optionsConsumer = {
        method: 'POST',
        url: process.env.KONG_ADMIN + '/consumers',
        form: {
            username: clientParam.clientname,
            custom_id: `${client._id}`
        },
        json: true
    };
    const optionsApplication = {
        method: 'POST',
        url: process.env.KONG_ADMIN +  "/consumers/"+clientParam.clientname+"/oauth2",        
        form: {
            'name': process.env.APP_NAME,
            'redirect_uris': process.env.REDIRECT_URI,
            'client_secret': clientParam.clientsecret,
            'client_id': clientParam.clientuid
        },
        json: true
    };
    await client.save();
    await request(optionsConsumer);
    await request(optionsApplication);
}

async function update(id, clientParam) {
    if(!objectID.isValid(id)) throw 'Invalid ID';
    const client = await Client.findById(id);

    if (!client) throw 'Client Not Found';
    if (client.clientuid !== clientParam.clientuid && await Client.findOne({ clientuid: clientParam.clientuid })) {
        throw 'clientuid "' + clientParam.clientuid + '" is already taken';
    }

    const optPatchConsumer = {
        method: 'PATCH',
        url: process.env.KONG_ADMIN + '/consumers/'+client.clientname,
        form: {
            username: clientParam.clientname
        },
        json: true
    };
    await request(optPatchConsumer);
    Object.assign(client, clientParam);
    await client.save();
}

async function _delete(id) {
    if(!objectID.isValid(id)) throw 'Invalid ID';
    const clientDeletion = await Client.findById(id);
    await Client.findByIdAndRemove(id);
    const optDeleteConsumer = {
        method: 'DELETE',
        url: process.env.KONG_ADMIN + '/consumers/'+clientDeletion.clientname,
        json: true
    };
    await request(optDeleteConsumer);
}
