var config = require("./../../config/setting.json");
var { ObjectId } = require("mongodb");
class ClaimService {
  databseConnection = require("./../database/database");
  claim = require("./../entities/claim");
  client;
  claimDatabase;
  claimCollection;
  constructor() {
    this.client = this.databseConnection.getMongoClient();
    this.claimDatabase = this.client.db(config.mongodb.database);
    this.claimCollection = this.claimDatabase.collection("claims");
  }

  async insertClaim(claim) {
    return await this.claimCollection.insertOne(claim);
  }

  async updateClaim(claim) {
    return await this.claimCollection.updateOne(
      {
        _id: new ObjectId(claim._id),
      },
      {
        $set: claim,
      }
    );
  }

  async getClaimByRoleId(roleId) {
    return await this.claimCollection.findOne({
      roleId: roleId,
    });
  }
  async getClaimByRoleAndClaimName(roleId, claimName) {
    return await this.claimCollection.findOne({
      roleId: roleId,
      claimName: claimName,
    });
  }
  async deleteClaim(claimId) {
    return await this.claimCollection.deleteOne({
      _id: new ObjectId(claimId),
    });
  }

  async getClaimsByRoleId(roleId) {
    const cursor = await this.claimCollection.find({
      roleId: roleId,
    });
    const claims = await cursor.toArray();
    const claimNames = claims.map((claim) => claim.claimName);
    return claimNames;
  }
}
module.exports = ClaimService;
