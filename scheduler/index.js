const schedule = require('node-schedule');
const moment = require('moment');


/**
 * Function to schedule a callback 15 minutes before a given moment date
 * Arguments:
 * 		1. Order due date as moment() obj
 * 		2. Callback function
 * 
 * 	Return Schedule object from scheduleJob()
 */
const schedule_pre_order_reminder = (moment_date, callback) => {

	let reminder_date = moment_date.subtract(15, 'minutes');

	if(reminder_date.isBefore(moment())){
		return false;
	}

	let day = reminder_date.get('date'),
			month = reminder_date.get('month') + 1,
			hour = reminder_date.get('hour'),
			minute = reminder_date.get('minute');

	return schedule.scheduleJob(`* ${minute} ${hour} ${day} ${month} *`, callback);
}




/**
 * Function to schedule a callback 15 minutes after a given moment date
 * Arguments:
 * 		1. Order due date as moment() obj
 * 		2. Callback function
 * 
 * 	Return Schedule object from scheduleJob()
 */
const shcedule_post_order_reminder = (moment_date, callback) => {
	let reminder_date = moment_date.add(15, 'minutes');

	if(reminder_date.isBefore(moment())){
		return false;
	}

	let day = reminder_date.get('date'),
			month = reminder_date.get('month') + 1,
			hour = reminder_date.get('hour'),
			minute = reminder_date.get('minute');

	return schedule.scheduleJob(`* ${minute} ${hour} ${day} ${month} *`, callback);
}




/**
 * Function to schedule a callback 1 day before given moment date at 15:00
 * Arguments: 
 * 		1. Order due date as moment() obj
 * 		2. Callback function 
 *	
 *	Return Schedule object from scheduleJob()
 */
const schedule_day_before_reminder = (moment_date, callback) => {

	let day = moment_date.get('date') - 1,
			month = moment_date.get('month') + 1,
			year = moment_date.get('year'),
			hour = moment_date.get('hour'),
			minute = moment_date.get('minute');

	let day_before_moment_date = moment(`${year}-${month}-${day} 15:00`, `YYYY-M-D HH:mm`);

	if(day_before_moment_date.isBefore(moment())){
		return false;
	}

	return schedule.scheduleJob(`* 0 15 ${day} ${month} *`, callback);

}





module.exports = {
	schedule_pre_order_reminder,
	schedule_day_before_reminder,
	shcedule_post_order_reminder
};