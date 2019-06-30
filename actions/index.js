static async modifyPaymentResource(params, body, query) {
    try {
        const {realm_token, payment_resource_token} = params;

        const {realm_id} = await this.findRealmIdWithToken(realm_token);

        const paymentResourceObj = new VNPaymentResource(payment_resource_token);

        const {vn_payment_resource_id: payment_resource_id, realm_id: auth_realm_id} = await paymentResourceObj.findInstanceDetailWithToken(['realm_id']);

        if (realm_id !== auth_realm_id) func.throwError('REALM NOT MATCH');
        const response = await paymentResourceObj.modifyInstanceDetailWithId(
            body,
            ['twilio_account_id', 'twilio_auth_token', 'twilio_from_num', 'status']);

        return {response};

    } catch (e) {
        throw e;
    }
}