const { ObjectId } = require("mongodb");
var config = require("./../../config/setting.json");
class RoleService {
  databseConnection = require("./../database/database");
  role = require("./../entities/role");
  client;
  roleDatabase;
  roleCollection;
  constructor() {
    this.client = this.databseConnection.getMongoClient();
    this.roleDatabase = this.client.db(config.mongodb.database);
    this.roleCollection = this.roleDatabase.collection("roles");
  }

  async insertRole(role) {
    return await this.roleCollection.insertOne(role);
  }

  async updateRole(role) {
    return await this.roleCollection.updateOne(
      {
        _id: new ObjectId(role._id),
      },
      {
        $set: role,
      }
    );
  }

  async deleteRole(roleId) {
    return await this.roleCollection.deleteOne({
      _id: new ObjectId(roleId),
    });
  }

  async getRoleByRoleName(roleName) {
    return await this.roleCollection.findOne(
      {
        roleName: roleName,
      },
      {}
    );
  }

  async getRoleById(roleId) {
    return await this.roleCollection.findOne(
      {
        _id: new ObjectId(roleId),
      },
      {}
    );
  }

  
}
module.exports = RoleService;
