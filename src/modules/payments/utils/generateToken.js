const generateToken = async () => {
    try {
        const consumerKey = process.env.MPESA_CONSUMER_KEY;
        const consumerSecret = process.env.MPESA_CONSUMER_SECRET;

        const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");

        const { data } = await axios.get(
            `${process.env.MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
            {
                headers: {
                    Authorization: `Basic ${auth}`,
                },
            }
        );


        return data.access_token;
    } catch (err) {
        console.error("Failed to generate M-Pesa token:", err.response?.data || err.message);
        throw new Error("Could not generate M-Pesa token");
    }
};

module.exports = generateToken;