const { ObjectId } = require("mongodb");
var config = require("./../../config/setting.json");
class UserRoleService {
  databseConnection = require("./../database/database");
  userRole = require("./../entities/user_role");
  client;
  userRoleDatabase;
  userRoleCollection;
  constructor() {
    this.client = this.databseConnection.getMongoClient();
    this.userRoleDatabase = this.client.db(config.mongodb.database);
    this.userRoleCollection = this.userRoleDatabase.collection("user_role");
  }

  async insertUserRole(userRole) {
    return await this.userRoleCollection.insertOne(userRole);
  }

  async updateUserRole(userRole) {
    return await this.userRoleCollection.updateOne(
      {
        _id: new ObjectId(userRole._id),
      },
      {
        $set: userRole,
      }
    );
  }

  async delteUserRole(userRoleId) {
    return await this.userRoleCollection.deleteOne({
      _id: new ObjectId(userRoleId),
    });
  }

  async getRoleIdsByUserId(userID) {
    const cursor = await this.userRoleCollection.find({
      userId: userID,
    });
    const userRoles = await cursor.toArray();
    const roleIds = userRoles.map((userRole) => userRole.roleId);
    return roleIds;
  }

  async getUserRoleById(id) {
    return await this.userRoleCollection.findOne({
      _id: new ObjectId(id),
    });
  }
  async getUserRoleByBoth(userId, roleId) {
    return await this.userRoleCollection.findOne({
      userId: userId,
      roleId: roleId,
    });
  }
}
module.exports = UserRoleService;
