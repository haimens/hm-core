const moment = require('moment');

const compareEarlier = (first_time, second_time) => {
    try {

        const first_moment = moment(first_time);
        const second_moment = moment(second_time);
        return first_moment.isBefore(second_moment);
    } catch (e) {
        throw e;
    }

};

module.exports = {compareEarlier};