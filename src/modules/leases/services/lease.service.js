const { Lease } = require("../../../database-config/index");


class LeaseService {
    // ✅ Create new lease
    async createLease(data) {
        const lease = await Lease.create(data);
        return lease;
    }

    // ✅ Get all leases
    async getAllLeases() {
        return await Lease.findAll();
    }

    // ✅ Get lease by ID
    async getLeaseById(id) {
        const lease = await Lease.findByPk(id);
        if (!lease) {
            const error = new Error("Lease not found");
            error.status = 404;
            throw error;
        }
        return lease;
    }

    // ✅ Update lease
    async updateLease(id, updates) {
        const lease = await this.getLeaseById(id);
        return await lease.update(updates);
    }


    // ✅ Delete lease
    async deleteLease(id) {
        const lease = await this.getLeaseById(id);
        await lease.destroy();
        return { message: "Lease deleted successfully" };
    }
}


module.exports = new LeaseService();