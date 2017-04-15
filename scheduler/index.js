const schedule = require('node-schedule');
const moment = require('moment');

const schedule_order_reminder = (moment_date, callback) => {

	let reminder_date = moment_date.subtract(3, 'hours');

	if(reminder_date.isBefore(moment())){
		console.log('before');
		return false;
	}

	let day = reminder_date.get('date'),
			month = reminder_date.get('month') + 1,
			hour = reminder_date.get('hour'),
			minute = reminder_date.get('minute');

			console.log(`set`);

	return schedule.scheduleJob(`* ${minute} ${hour} ${day} ${month} *`, callback);
}




const schedule_day_before_reminder = (moment_date, callback) => {

	let day = moment_date.get('date') - 1,
			month = moment_date.get('month') + 1,
			year = moment_date.get('year'),
			hour = moment_date.get('hour'),
			minute = moment_date.get('minute');

	let day_before_moment_date = moment(`${year}-${month}-${day} 10:00`, `YYYY-M-D HH:mm`);

	if(day_before_moment_date.isBefore(moment())){
		return false;
	}


	return schedule.scheduleJob(`* 0 10 ${day} ${month} *`, callback);

}





module.exports = {
	schedule_order_reminder,
	schedule_day_before_reminder
};